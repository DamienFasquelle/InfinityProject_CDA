<?php

namespace App\Controller;

use App\Entity\FavoriteGame;
use App\Repository\FavoriteGameRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;

#[Route('/api/favorite', name: 'api_favorite_')]
class FavoriteController extends AbstractController
{
    #[Route('/add', name: 'add', methods: ['POST'])]
    public function addFavorite(
        Request $request,
        EntityManagerInterface $em,
        FavoriteGameRepository $favoriteRepo,
        Security $security
    ): JsonResponse {
        $user = $security->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Vous devez être connecté pour ajouter un jeu aux favoris.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $gameId = $data['gameId'] ?? null;

        if (!$gameId) {
            return new JsonResponse(['error' => 'L\'identifiant du jeu est requis.'], 400);
        }

        $existingFavorite = $favoriteRepo->findOneBy(['user' => $user, 'gameId' => $gameId]);
        if ($existingFavorite) {
            return new JsonResponse(['error' => 'Ce jeu est déjà dans vos favoris.'], 400);
        }

        $favoriteGame = new FavoriteGame();
        $favoriteGame->setUser($user);
        $favoriteGame->setGameId($gameId);

        $em->persist($favoriteGame);
        $em->flush();

        return new JsonResponse(['success' => 'Jeu ajouté aux favoris.'], 201);
    }

    #[Route('/remove', name: 'remove', methods: ['POST'])]
    public function removeFavorite(
        Request $request,
        FavoriteGameRepository $favoriteRepo,
        EntityManagerInterface $em,
        Security $security
    ): JsonResponse {
        $user = $security->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Vous devez être connecté.'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $gameId = $data['gameId'] ?? null;

        if (!$gameId) {
            return new JsonResponse(['error' => 'L\'identifiant du jeu est requis.'], 400);
        }

        $favoriteGame = $favoriteRepo->findOneBy(['user' => $user, 'gameId' => $gameId]);

        if (!$favoriteGame) {
            return new JsonResponse(['error' => 'Ce jeu ne figure pas dans vos favoris.'], 404);
        }

        $em->remove($favoriteGame);
        $em->flush();

        return new JsonResponse(['success' => 'Jeu supprimé des favoris.'], 200);
    }

    #[Route('/list', name: 'list', methods: ['GET'])]
    public function listFavorites(
        FavoriteGameRepository $favoriteRepo,
        Security $security
    ): JsonResponse {
        $user = $security->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Vous devez être connecté.'], 401);
        }

        $favorites = $favoriteRepo->findBy(['user' => $user]);

        $favoriteGames = array_map(function ($favorite) {
            return $favorite->getGameId();
        }, $favorites);

        return new JsonResponse($favoriteGames, 200);
    }
}
