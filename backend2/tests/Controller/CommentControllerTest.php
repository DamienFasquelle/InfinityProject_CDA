<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CommentControllerTest extends WebTestCase
{
    private function loginAndGetToken($client): string
    {
        $client->request(
            'POST',
            '/api/login_check',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'fasquelled@hotmail.com',
                'password' => 'admin'
            ])
        );

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $data);

        return $data['token'];
    }

    public function testCreateUpdateDeleteComment(): void
    {
        $client = static::createClient();
        $token = $this->loginAndGetToken($client);

        // Création du commentaire
        $client->request(
            'POST',
            '/api/comment',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token
            ],
            json_encode([
                'content' => 'Un super jeu !',
                'rating' => 5,
                'gameId' => 101
            ])
        );

        $this->assertResponseStatusCodeSame(201);
        $created = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $created);
        $this->assertEquals('Un super jeu !', $created['content']);
        $commentId = $created['id'];

        // Mise à jour du commentaire
        $client->request(
            'PUT',
            '/api/comment/' . $commentId,
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token
            ],
            json_encode([
                'content' => 'Mise à jour du commentaire',
                'rating' => 4
            ])
        );

        $this->assertResponseIsSuccessful();
        $updated = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Mise à jour du commentaire', $updated['content']);
        $this->assertEquals(4, $updated['rating']);

        // Suppression du commentaire
        $client->request(
            'DELETE',
            '/api/comment/' . $commentId,
            [],
            [],
            [
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token
            ]
        );

        $this->assertResponseIsSuccessful();
        $deleted = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $deleted);
    }

    public function testGetCommentsByGame(): void
    {
        $client = static::createClient();
        $client->request('GET', '/comments/101');

        $this->assertResponseIsSuccessful();
        $comments = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($comments);
    }
}
