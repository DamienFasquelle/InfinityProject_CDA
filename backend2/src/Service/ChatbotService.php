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
     * Détermine si une réponse contient une recommandation.
     */
    private function isRecommendation(string $content): bool
    {
        return stripos($content, 'Ces jeux sont disponibles') !== false;
    }

    /**
     * Génère une réponse complète du chatbot.
     */
    public function getChatbotResponse(string $userMessage): string
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
                            'content' => <<<EOT
Tu es un assistant expert en jeux vidéo. Tu aides les utilisateurs à trouver des jeux qui leur correspondent parfaitement.

Commence par leur poser des questions pour mieux cerner leurs goûts (type de jeu, plateforme, ambiance, solo/multi...). Sois naturel et sympathique.

Quand tu as assez d'informations, propose entre 3 et 5 jeux. Pour chaque jeu, donne :
- Le nom
- Une brève description
- La plateforme

Termine toujours ta recommandation par : 
🔍 Ces jeux sont disponibles dans la section *Jeux recommandés* sur notre site.

Si l'utilisateur ne parle pas de jeux, continue la conversation normalement.
EOT
                        ],
                        [
                            'role' => 'user',
                            'content' => $userMessage
                        ],
                    ],
                    'temperature' => 0.8,
                    'max_tokens' => 600,
                ],
            ]);

            $data = $response->toArray();
            $content = $data['choices'][0]['message']['content'] ?? '';

            // Ajoute une trace en console Symfony
            error_log('🧠 Réponse OpenAI : ' . $content);

            return $content;

        } catch (\Exception $e) {
            if ($e->getCode() === 429) {
                return "🚫 Trop de requêtes envoyées. Veuillez patienter un moment.";
            }

            return "❌ Une erreur est survenue avec OpenAI : " . $e->getMessage();
        }
    }
}
