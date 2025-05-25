<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class ChatbotService
{
    private string $openAiApiKey;
    private string $chatGptApiUrl;
    private HttpClientInterface $httpClient;

    public function __construct(
        ParameterBagInterface $params,
        HttpClientInterface $httpClient
    ) {
        $this->httpClient = $httpClient;
        $this->openAiApiKey = $params->get('OPENAI_API_KEY');
        $this->chatGptApiUrl = $params->get('chatGPTApiUrl');
    }

    /**
     * Vérifie si le message utilisateur est une demande de recommandation.
     */
    private function isRecommendationRequest(string $message): bool
    {
        $keywords = ['jeux', 'recommande', 'suggestion', 'jeu vidéo', 'quel jeu'];
        foreach ($keywords as $keyword) {
            if (stripos($message, $keyword) !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Point d'entrée principal : retourne une réponse à afficher au client.
     */
    public function getChatbotResponse(string $userMessage): string
    {
        error_log('➡️ URL utilisée : ' . $this->chatGptApiUrl);

        $openAiResponse = $this->getOpenAiResponse($userMessage);

        if ($this->isRecommendationRequest($userMessage)) {
            $openAiResponse .= "\n\n🔍 Pour explorer ces jeux, utilisez la barre de recherche ou visitez la section *Jeux recommandés*.";
        }

        return $openAiResponse;
    }

    /**
     * Envoie le message à l'API OpenAI et traite la réponse.
     */
    private function getOpenAiResponse(string $message): string
    {
        try {
            $response = $this->httpClient->request('POST', $this->chatGptApiUrl, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->openAiApiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'gpt-4',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Tu es un assistant qui aide les utilisateurs à trouver des jeux vidéo similaires. Réponds sous forme de tableau JSON : [{"title": "Jeu 1"}, {"title": "Jeu 2"}].'
                        ],
                        [
                            'role' => 'user',
                            'content' => $message
                        ],
                    ],
                    'max_tokens' => 150,
                    'temperature' => 0.7,
                ],
            ]);

            $data = $response->toArray();

            $content = $data['choices'][0]['message']['content'] ?? '';
            $games = json_decode($content, true);

            if (is_array($games) && !empty($games)) {
                $titles = array_map(fn($g) => $g['title'] ?? 'Titre inconnu', $games);
                return "🎮 Je vous recommande les jeux suivants : " . implode(", ", $titles) . ".";
            }

            return "🤖 Je suis un chatbot conçu pour vous aider à trouver des jeux vidéo. Essayez une autre question liée aux jeux !";

        } catch (\Exception $e) {
            if ($e->getCode() === 429) {
                return "🚫 Trop de requêtes envoyées. Veuillez patienter avant de réessayer.";
            }

            return "❌ Une erreur est survenue lors de la requête à OpenAI : " . $e->getMessage();
        }
    }
}
