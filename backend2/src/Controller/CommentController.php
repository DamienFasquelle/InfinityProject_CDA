<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Repository\CommentRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Doctrine\ORM\EntityManagerInterface; 

class CommentController extends AbstractController
{
    #[Route('/api/comment', name: 'create_comment', methods: ['POST'])]
    public function create(Request $request, UserInterface $user, CommentRepository $commentRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$this->isGranted('ROLE_USER')) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['content']) || !isset($data['rating']) || !isset($data['gameId'])) {
            return $this->json(['error' => 'Invalid data'], 400);
        }

        $comment = new Comment();
        $comment->setContent($data['content']);
        $comment->setRating($data['rating']);
        $comment->setCreatedAt(new \DateTimeImmutable());
        $comment->setUpdatedAt(new \DateTimeImmutable());
        $comment->setIdGames($data['gameId']);
        $comment->setIdUser($user);

        $entityManager->persist($comment);   
        $entityManager->flush(); 

        return $this->json([
    'id' => $comment->getId(),
    'content' => $comment->getContent(),
    'rating' => $comment->getRating(),
    'created_at' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
   'user' => [
                    'id' => $comment->getIdUser()?->getId(),
                    'username' => $comment->getIdUser()?->getUsername(),
                    'photo' => $comment->getIdUser()?->getPhoto(),
                ],
    'gameId' => $data['gameId'],
], 201);

    }

    #[Route('/api/comment/{id}', name: 'update_comment', methods: ['PUT'])]
    public function update($id, Request $request, CommentRepository $commentRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $comment = $commentRepository->find($id);
        if (!$comment) {
            return $this->json(['error' => 'Comment not found'], 404);
        }

        $user = $this->getUser();
        if ($comment->getIdUser() !== $user) {
            throw new AccessDeniedException('Vous ne pouvez pas modifier ce commentaire.');
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['content'])) {
            $comment->setContent($data['content']);
        }
        if (isset($data['rating'])) {
            $comment->setRating($data['rating']);
        }

        $comment->setUpdatedAt(new \DateTimeImmutable());

        $entityManager->flush();  

       return $this->json([
    'id' => $comment->getId(),
    'content' => $comment->getContent(),
    'rating' => $comment->getRating(),
    'created_at' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
    'updated_at' => $comment->getUpdatedAt()->format('Y-m-d H:i:s'),
    'user' => [
                    'id' => $comment->getIdUser()?->getId(),
                    'username' => $comment->getIdUser()?->getUsername(),
                    'photo' => $comment->getIdUser()?->getPhoto(),
                ],
    'gameId' => $comment->getIdGames(),
]);

    }

    #[Route('/api/comment/{id}', name: 'delete_comment', methods: ['DELETE'])]
    public function delete($id, CommentRepository $commentRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $comment = $commentRepository->find($id);
        if (!$comment) {
            return $this->json(['error' => 'Comment not found'], 404);
        }

        $user = $this->getUser();
        if ($comment->getIdUser() !== $user) {
            throw new AccessDeniedException('Vous ne pouvez pas supprimer ce commentaire.');
        }

        $entityManager->remove($comment);  
        $entityManager->flush(); 

        return $this->json(['message' => 'Commentaire supprimé avec succès']);
    }

    #[Route('/comments/{gameId}', name: 'get_comments_by_game', methods: ['GET'])]
public function getCommentsByGame(int $gameId, CommentRepository $commentRepository): JsonResponse
{
    $comments = $commentRepository->findBy(['idGames' => $gameId]);


    if (!$comments) {
        return $this->json([]);  // tableau vide
    }

    $commentsData = array_map(function ($comment) {
        return [
            'id' => $comment->getId(),
            'content' => $comment->getContent(),
            'rating' => $comment->getRating(),
            'created_at' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
            'user' => [
                    'id' => $comment->getIdUser()?->getId(),
                    'username' => $comment->getIdUser()?->getUsername(),
                    'photo' => $comment->getIdUser()?->getPhoto(),
                ],
        ];
    }, $comments);

    return $this->json($commentsData);
}
}
