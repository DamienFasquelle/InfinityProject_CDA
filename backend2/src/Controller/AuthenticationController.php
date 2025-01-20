<?php       


// src/Controller/AuthenticationController.php
namespace App\Controller;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class AuthenticationController extends AbstractController
{
    #[Route('/api/login_check', name: 'api_login_check', methods: ['POST'])]
    public function login(JWTTokenManagerInterface $JWTManager): JsonResponse
    {
      
        $user = $this->getUser(); 
        $token = $JWTManager->create($user); 
        
        return new JsonResponse(['token' => $token]);
    }
}
