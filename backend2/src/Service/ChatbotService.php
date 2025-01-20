<?php

namespace App\Service;

use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class ChatbotService
{
    private $rawgApiKey;
    private $chatGPTApiUrl;
    private $chatGPTApiKey;
    private $httpClient;

    public function __construct(ParameterBagInterface $parameterBag)
    {
        $this->httpClient = HttpClient::create();
        $this->rawgApiKey = $parameterBag->get('rawgApiKey');
        $this->chatGPTApiUrl = $parameterBag->get('chatGPTApiUrl');
        $this->chatGPTApiKey = $parameterBag->get('chatGPTApiKey');
    }

    private function isRecommendationRequest(string $message): bool
    {
        $keywords = ['jeux', 'recommande', 'suggestion', 'jeu vidéo', 'quel jeu'];
        foreach ($keywords as $keyword) {
            if (stripos($message, $keyword) !== false) {
                error_log("Mot-clé détecté : $keyword");
                return true;
            }
        }
        return false;
    }
    


    public function getChatbotResponse(string $userMessage): string
    {
        $openAiResponse = $this->getOpenAiResponse($userMessage);
    
     
        if ($this->isRecommendationRequest($userMessage)) {
            $openAiResponse .= "\n\nSi vous voulez en savoir plus sur ces jeux ou d'autres, utilisez notre barre de recherche pour les explorer.";
        }
    
        return $openAiResponse;
    }
    

    


    private function getOpenAiResponse(string $message): string
    {
        try {
            $response = $this->httpClient->request('POST', $this->chatGPTApiUrl, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->chatGPTApiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'gpt-4',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Tu es un assistant pour un site web qui propose des recommandations de jeux vidéo en utilisant l’API RAWG.io. Toutes les questions doivent être traitées dans ce contexte.'
                        ],
                        ['role' => 'user', 'content' => $message],
                    ],
                    'max_tokens' => 150,
                    'temperature' => 0.7,
                ],
            ]);

            $data = $response->toArray();
            return $data['choices'][0]['message']['content'] ?? "Je n'ai pas pu obtenir de réponse.";
        } catch (\Exception $e) {
            if ($e->getCode() === 429) {
                return "Trop de requêtes envoyées. Merci d'attendre un moment avant de réessayer.";
            }
            return "Une erreur est survenue lors de l'appel à OpenAI : " . $e->getMessage();
        }
    }

    private function getRecommendedGames(): array
    {
        try {
            $response = $this->httpClient->request('GET', "https://api.rawg.io/api/games?key={$this->rawgApiKey}&ordering=-rating&page_size=5");
            $data = $response->toArray();
    
         
            return array_map(fn($game) => [
                'id' => $game['id'],  
                'name' => $game['name'],
                'image' => $game['background_image'],
                'rating' => $game['rating'],
            ], $data['results'] ?? []);
        } catch (\Exception $e) {
          
            return [];
        }
    }
    
}
