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
            'password' => 'StrongPass1!',
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
        // Attention à l’accent dans "succès"
        $this->assertStringContainsString('succès', $responseData['message']);
    }

    public function testRegisterMissingFields(): void
    {
        $client = static::createClient();

        $payload = [
            'email' => 'incomplete@example.com',
            // username manquant
            'password' => 'StrongPass1!',
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
        $this->assertEquals('Ils manquent des informations', $responseData['message']);
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
        $this->assertEquals('Erreur, veuillez réécrire vos informations', $responseData['message']);
    }

    public function testRegisterDuplicateEmail(): void
    {
        $client = static::createClient();

        $payload = [
            'email' => 'fasquelled@hotmail.com', // email déjà existant dans ta fixture
            'username' => 'duplicateuser',
            'password' => 'StrongPass1!',
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

    public function testRegisterWeakPassword(): void
    {
        $client = static::createClient();

        $payload = [
            'email' => 'weakpass@example.com',
            'username' => 'weakuser',
            'password' => '123', // trop faible
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
        $this->assertEquals('Le mot de passe est trop faible', $responseData['message']);
    }
}
