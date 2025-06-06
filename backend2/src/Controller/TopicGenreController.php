<?php

namespace App\Controller;

use App\Entity\TopicGenre;
use App\Repository\TopicGenreRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class TopicGenreController extends AbstractController
{
    // ✅ Route publique pour obtenir tous les genres
    #[Route('/api/genres/list', name: 'list_genres_public', methods: ['GET'])]
    public function listPublic(TopicGenreRepository $repo): JsonResponse
    {
        $genres = $repo->findAll();
        $data = [];

        foreach ($genres as $genre) {
            $data[] = [
                'id' => $genre->getId(),
                'name' => $genre->getName(),
                'description' => $genre->getDescription(),
            ];
        }

        return $this->json($data);
    }

    // 🔐 Routes sécurisées pour l'administration
    #[Route('/api/topic-genre/create', name: 'create_genre', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $name = $data['name'] ?? null;
        $description = $data['description'] ?? null;

        if (!$name) {
            return $this->json(['error' => 'Le nom est requis.'], 400);
        }

        $genre = new TopicGenre();
        $genre->setName($name);
        $genre->setDescription($description);

        $em->persist($genre);
        $em->flush();

        return $this->json(['message' => 'Genre créé avec succès.', 'id' => $genre->getId()], 201);
    }

    #[Route('/api/topic-genre/{id}/edit', name: 'edit_genre', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function edit(int $id, Request $request, TopicGenreRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $genre = $repo->find($id);
        if (!$genre) {
            return $this->json(['error' => 'Genre introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $genre->setName($data['name'] ?? $genre->getName());
        $genre->setDescription($data['description'] ?? $genre->getDescription());

        $em->flush();

        return $this->json(['message' => 'Genre mis à jour avec succès.']);
    }

    #[Route('/api/topic-genre/{id}/delete', name: 'delete_genre', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id, TopicGenreRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $genre = $repo->find($id);
        if (!$genre) {
            return $this->json(['error' => 'Genre introuvable.'], 404);
        }

        $em->remove($genre);
        $em->flush();

        return $this->json(['message' => 'Genre supprimé avec succès.']);
    }
}
