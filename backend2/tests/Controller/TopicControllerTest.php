<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class TopicControllerTest extends WebTestCase
{
    private ?string $token = null;

    private function getAuthenticatedClient(): \Symfony\Bundle\FrameworkBundle\KernelBrowser
    {
        $client = static::createClient();

        $client->request('POST', '/api/login_check', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'fasquelled@hotmail.com',
            'password' => 'admin'
        ]));

        $response = $client->getResponse();
        $this->assertResponseIsSuccessful();

        $data = json_decode($response->getContent(), true);
        $this->token = $data['token'];

        return $client;
    }

    public function testCreateListDeleteTopic(): void
    {
        $client = $this->getAuthenticatedClient();

        // 1) Création du topic
        // On envoie un POST multipart/form-data (ici simulé avec $client->request 5e argument = files)
        $client->request('POST', '/api/topic/create', [
            'title' => 'Topic de test',
            'description' => 'Description de test',
            'genre_id' => 1,
        ], [], [
            'HTTP_Authorization' => 'Bearer ' . $this->token,
        ]);

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $data);
        $topicId = $data['id'];

        // 2) Liste des topics
        $client->request('GET', '/api/topic/list');
        $this->assertResponseIsSuccessful();

        $topics = json_decode($client->getResponse()->getContent(), true);
        $found = false;
        foreach ($topics as $topic) {
            if ($topic['id'] === $topicId) {
                $found = true;
                break;
            }
        }
        $this->assertTrue($found, 'Le topic créé doit être présent dans la liste');

        // // 3) Suppression du topic
        // $client->request('DELETE', "/api/topic/$topicId", [], [], [
        //     'HTTP_Authorization' => 'Bearer ' . $this->token,
        // ]);
        // $this->assertResponseIsSuccessful();

        // $deleteData = json_decode($client->getResponse()->getContent(), true);
        // $this->assertArrayHasKey('success', $deleteData);
    }
}
