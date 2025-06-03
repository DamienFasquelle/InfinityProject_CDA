<?php

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class RegistrationControllerTest extends WebTestCase
{
    public function testRegisterSuccess(): void
    {
        $client = static::createClient();

        $payload = [
            'email' => 'newuser@example.com',
            'username' => 'newuser',
            'password' => 'securepassword',
        ];

        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(201);
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $responseData);
        $this->assertStringContainsString('succés', $responseData['message']);
    }

    public function testRegisterMissingFields(): void
    {
        $client = static::createClient();

        $payload = [
            'email' => 'incomplete@example.com',
            // username manquant
            'password' => 'password',
        ];

        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(400);
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Missing required fields', $responseData['message']);
    }

    public function testRegisterInvalidJson(): void
    {
        $client = static::createClient();

        // Envoi d'un JSON mal formé
        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            '{bad json}'
        );

        $this->assertResponseStatusCodeSame(400);
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Invalid JSON', $responseData['message']);
    }

    public function testRegisterDuplicateEmail(): void
    {
        $client = static::createClient();

        $payload = [
            'email' => 'fasquelled@hotmail.com', // email déjà dans la fixture/admin
            'username' => 'duplicateuser',
            'password' => 'password',
        ];

        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(409);
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Utilisateur déjà existant', $responseData['message']);
    }
}
