<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class TopicGenreControllerTest extends WebTestCase
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

    public function testListGenresPublic(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/genres/list');
        $this->assertResponseIsSuccessful();
    }

    public function testCreateEditDeleteGenre(): void
    {
        $client = $this->getAuthenticatedClient();

        $client->request('POST', '/api/topic-genre/create', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Authorization' => 'Bearer ' . $this->token,
        ], json_encode([
            'name' => 'Test Genre',
            'description' => 'Genre de test',
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $genreId = $data['id'];

        $client->request('PUT', "/api/topic-genre/$genreId/edit", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Authorization' => 'Bearer ' . $this->token,
        ], json_encode([
            'name' => 'Genre Modifié',
        ]));

        $this->assertResponseIsSuccessful();

        // $client->request('DELETE', "/api/topic-genre/$genreId/delete", [], [], [
        //     'HTTP_Authorization' => 'Bearer ' . $this->token,
        // ]);

        // $this->assertResponseIsSuccessful();
    }
}
