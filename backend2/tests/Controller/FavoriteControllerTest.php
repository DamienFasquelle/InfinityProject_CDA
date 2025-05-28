<?php

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class FavoriteControllerTest extends WebTestCase
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

    public function testAddFavorite(): void
    {
        $client = static::createClient();
        $token = $this->logInAndGetToken($client);

        // Test ajout d'un favori
        $client->request(
            'POST',
            '/api/favorite/add',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            ],
            json_encode(['gameId' => 123])
        );

        $this->assertResponseStatusCodeSame(201);
        $this->assertJson($client->getResponse()->getContent());
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('success', $response);

        // Test doublon (même gameId)
        $client->request(
            'POST',
            '/api/favorite/add',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            ],
            json_encode(['gameId' => 123])
        );
        $this->assertResponseStatusCodeSame(400);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('error', $response);
    }

    public function testRemoveFavorite(): void
    {
        $client = static::createClient();
        $token = $this->logInAndGetToken($client);

        // Supprime un favori existant (celui qu'on a ajouté précédemment)
        $client->request(
            'POST',
            '/api/favorite/remove',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            ],
            json_encode(['gameId' => 123])
        );

        $this->assertResponseStatusCodeSame(200);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('success', $response);

        // Supprime un favori qui n'existe pas
        $client->request(
            'POST',
            '/api/favorite/remove',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            ],
            json_encode(['gameId' => 9999])
        );

        $this->assertResponseStatusCodeSame(404);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('error', $response);
    }

    public function testListFavorites(): void
    {
        $client = static::createClient();
        $token = $this->logInAndGetToken($client);

        // Ajouter un favori pour être sûr d'en avoir un dans la liste
        $client->request(
            'POST',
            '/api/favorite/add',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            ],
            json_encode(['gameId' => 456])
        );
        $this->assertResponseStatusCodeSame(201);

        // Liste des favoris
        $client->request(
            'GET',
            '/api/favorite/list',
            [],
            [],
            [
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            ]
        );

        $this->assertResponseIsSuccessful();
        $favorites = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($favorites);
        $this->assertContains(456, $favorites);
    }
}
