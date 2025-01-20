<?php

namespace App\Controller;

use App\Service\ChatbotService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ChatbotController extends AbstractController
{
    private $chatbotService;

    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    #[Route('/api/chatbot', name: 'chatbot', methods: ['POST'])]
public function interact(Request $request): JsonResponse
{
    $content = json_decode($request->getContent(), true);
    $userMessage = $content['message'] ?? '';

    $chatbotResponse = $this->chatbotService->getChatbotResponse($userMessage);

    return new JsonResponse($chatbotResponse);
}

}
