<?php

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class UtilTest extends WebTestCase
{
    private function logInAndGetToken($client): string
    {
        // Envoie la requête de login
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

    public function testHomepage(): void
    {
        $client = static::createClient();
        $client->request('GET', '/');
        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Bienvenue sur notre site !');
    }

    public function testGetApiRoute(): void
    {
        $client = static::createClient();
        $token = $this->logInAndGetToken($client);

        $client->request(
            'GET',
            '/api/users',
            [],
            [],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]
        );

        $this->assertResponseIsSuccessful();
        $this->assertJson($client->getResponse()->getContent());
    }

    public function testPostApiRoute(): void
    {
        $client = static::createClient();
        $token = $this->logInAndGetToken($client);
       $email = 'test_' . uniqid() . '@example.com';

$client->request(
    'POST',
    '/api/users',
    [],
    [],
    [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_AUTHORIZATION' => 'Bearer ' . $token
    ],
    json_encode([
        'username' => 'testuser',
        'email' => $email,
        'password' => 'testpass'
    ])
);


        $this->assertResponseStatusCodeSame(201); // ou 200 selon ton API
        $this->assertJson($client->getResponse()->getContent());

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $data);
        $this->assertEquals('testuser', $data['username']);
    }
}
