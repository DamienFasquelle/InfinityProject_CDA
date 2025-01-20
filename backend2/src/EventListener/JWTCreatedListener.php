<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;

class JWTCreatedListener
{
    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        // Récupère l'utilisateur authentifié
        $user = $event->getUser();

        if ($user instanceof \App\Entity\User) {
            // Récupère l'email de l'utilisateur
            $email = $user->getEmail();

            $userId = $user->getId();
            
            // Récupère les données actuelles du payload
            $payload = $event->getData();

            // Remplace le champ 'username' par l'email
            $payload['username'] = $email; 
            
            $payload['userId'] = $userId;// Remplace 'username' par l'email

            // Assure-toi que la clé 'username' est correctement définie et mise à jour
            $event->setData($payload); // Mets à jour le payload avec les nouvelles données
        }
    }
}
