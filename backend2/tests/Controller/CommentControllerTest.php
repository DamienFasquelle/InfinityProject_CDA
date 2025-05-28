<?php

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CommentControllerTest extends WebTestCase
{
    private function logInAndGetToken($client): string
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
        $token = $this->logInAndGetToken($client);

        // Création
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
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $responseData);
        $commentId = $responseData['id'];

        // Mise à jour
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
        $updatedData = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Mise à jour du commentaire', $updatedData['content']);
        $this->assertEquals(4, $updatedData['rating']);

        // Suppression
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
        $deletedData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $deletedData);
    }

    public function testGetCommentsByGame(): void
    {
        $client = static::createClient();

        $client->request(
            'GET',
            '/comments/101'
        );

        $this->assertResponseIsSuccessful();
        $comments = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($comments);
    }

}
