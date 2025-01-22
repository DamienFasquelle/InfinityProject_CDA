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
                            'content' => 'Tu es un assistant qui aide les utilisateurs à trouver des jeux vidéo similaires à ceux qu\'ils mentionnent. Lorsque l\'utilisateur demande des recommandations, tu dois répondre sous la forme d\'un tableau JSON avec des objets contenant des titres de jeux. Par exemple : [{"title": "Jeu 1"}, {"title": "Jeu 2"}].'
                        ],
                        ['role' => 'user', 'content' => $message],
                    ],
                    'max_tokens' => 150,
                    'temperature' => 0.7,
                ],
            ]);
    
            $data = $response->toArray();
    
            // Essayer de décoder la réponse en format JSON
            $games = json_decode($data['choices'][0]['message']['content'], true);
    
            if (is_array($games) && !empty($games)) {
                // Si la réponse est un tableau d'objets avec des titres de jeux
                $gameTitles = array_map(function ($game) {
                    return $game['title'] ?? 'Titre inconnu';
                }, $games);
    
                // Convertir le tableau de titres en une chaîne de caractères
                return "Je vous recommande les jeux suivants : " . implode(", ", $gameTitles) . ", je vous invite à vous diriger sur la page Jeux recommandés, vous y trouverez toutes les recommandations de jeux.";
            }
    
            return "Je suis un chatbot programmé pour répondre au besoin de recommandations de jeux vidéo. Merci de me poser une question en rapport avec les jeux vidéo.";
        } catch (\Exception $e) {
            if ($e->getCode() === 429) {
                return "Trop de requêtes envoyées. Merci d'attendre un moment avant de réessayer.";
            }
            return "Une erreur est survenue lors de l'appel à OpenAI : " . $e->getMessage();
        }
    }
    
    
}
