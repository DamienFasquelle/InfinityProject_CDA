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
     * Détermine si une réponse contient une recommandation de jeux.
     */
    public function isRecommendation(string $content): bool
    {
        return stripos($content, 'Ces jeux sont disponibles') !== false;
    }

    /**
     * Génère une réponse complète du chatbot.
     * @param string $userMessage
     * @param array $chatHistory Historique sous forme [['role' => 'user'|'assistant', 'content' => '...'], ...]
     * @return string
     */
    public function getChatbotResponse(string $userMessage, array $chatHistory = []): string
    {
        $systemPrompt = <<<EOT
Tu es un assistant expert en jeux vidéo pour un site web. Tu aides les utilisateurs à trouver des jeux adaptés à leurs goûts.

Dans un premier temps, si l'utilisateur mentionne un ou plusieurs jeux, tu les reconnais et tu les utilises pour affiner tes recommandations et tu peux déjà lui proposer des jeux similaires.
Si l'utilisateur ne mentionne pas de jeux, tu lui demandes des précisions sur ses préférences avant de faire des recommandations.

Commence par leur poser des questions pour cerner ce qu’ils aiment :
- Genres préférés (action, stratégie, RPG...)
- Plateformes (PC, PlayStation, Switch, etc.)
- Préférence solo/multijoueur
- Ambiances recherchées (futuriste, fantasy, réaliste, etc.)

Quand tu as assez d’informations, propose entre 3 et 5 jeux. Pour chaque jeu, donne :
- 🕹️ Nom
- 📄 Brève description
- 🖥️ Plateformes disponibles

Termine toujours avec :

🔍 Ces jeux sont disponibles dans la section *Jeux recommandés* sur notre site.

📋 Liste des jeux recommandés :
- [Titre du jeu 1]
- [Titre du jeu 2]
- [Titre du jeu 3]

Si l’utilisateur ne parle pas de jeux, continue la discussion normalement en étant sympathique, mais reviens sur la thématique jeux quand c’est possible.
EOT;

        $messages = array_merge(
            [['role' => 'system', 'content' => $systemPrompt]],
            $chatHistory,
            [['role' => 'user', 'content' => $userMessage]]
        );

        try {
            $response = $this->httpClient->request('POST', $this->chatGptApiUrl, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->openAiApiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'gpt-4',
                    'messages' => $messages,
                    'temperature' => 0.8,
                    'max_tokens' => 600,
                ],
            ]);

            $data = $response->toArray();
            $content = $data['choices'][0]['message']['content'] ?? '';

            // Log Symfony (visible en dev)
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
