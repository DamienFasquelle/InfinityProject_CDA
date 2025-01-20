<?php

namespace App\Controller;

use App\Entity\FavoriteGame;
use App\Repository\FavoriteGameRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/favorite', name: 'api_favorite_')]  // Préfixe '/api' ajouté pour l'API
class FavoriteController extends AbstractController
{
    // Route pour ajouter un jeu aux favoris
    #[Route('/add', name: 'add', methods: ['POST'])]
    public function addFavorite(Request $request, EntityManagerInterface $em, FavoriteGameRepository $favoriteRepo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $gameId = $data['gameId'] ?? null;

        if (!$gameId) {
            return new JsonResponse(['error' => 'Game ID is required'], 400);
        }

        // Vérifier si le jeu est déjà dans les favoris
        $existingFavorite = $favoriteRepo->findOneBy(['user' => $user, 'gameId' => $gameId]);
        if ($existingFavorite) {
            return new JsonResponse(['error' => 'Game is already in favorites'], 400);
        }

        $favoriteGame = new FavoriteGame();
        $favoriteGame->setUser($user);
        $favoriteGame->setGameId($gameId);

        $em->persist($favoriteGame);
        $em->flush();

        return new JsonResponse(['success' => 'Game added to favorites'], 201);
    }

    // Route pour supprimer un jeu des favoris
    #[Route('/remove', name: 'remove', methods: ['POST'])]
    public function removeFavorite(Request $request, FavoriteGameRepository $favoriteRepo, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $gameId = $data['gameId'] ?? null;

        if (!$gameId) {
            return new JsonResponse(['error' => 'Game ID is required'], 400);
        }

        // Trouver et supprimer le jeu des favoris
        $favoriteGame = $favoriteRepo->findOneBy(['user' => $user, 'gameId' => $gameId]);

        if (!$favoriteGame) {
            return new JsonResponse(['error' => 'Game not found in favorites'], 404);
        }

        $em->remove($favoriteGame);
        $em->flush();

        return new JsonResponse(['success' => 'Game removed from favorites'], 200);
    }

    // Route pour lister les jeux favoris
    #[Route('/list', name: 'list', methods: ['GET'])]
    public function listFavorites(FavoriteGameRepository $favoriteRepo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $favorites = $favoriteRepo->findBy(['user' => $user]);

        $favoriteGames = array_map(function ($favorite) {
            return $favorite->getGameId();
        }, $favorites);

        return new JsonResponse($favoriteGames, 200);
    }
}
