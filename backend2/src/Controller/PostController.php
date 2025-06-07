<?php

namespace App\Controller;

use App\Entity\Post;
use App\Repository\PostRepository;
use App\Repository\TopicRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;

#[Route('/api/post', name: 'api_post_')]
class PostController extends AbstractController
{
    #[Route('/create/{topicId}', name: 'create', methods: ['POST'])]
    public function createPost(
        int $topicId,
        Request $request,
        TopicRepository $topicRepo,
        EntityManagerInterface $em,
        Security $security
    ): JsonResponse {
        $user = $security->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }

        $topic = $topicRepo->find($topicId);
        if (!$topic) {
            return new JsonResponse(['error' => 'Topic introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $content = $data['content'] ?? null;

        if (!$content) {
            return new JsonResponse(['error' => 'Le contenu est requis.'], Response::HTTP_BAD_REQUEST);
        }

        $post = new Post();
        $post->setContent($content);
        $post->setCreatedAt(new \DateTimeImmutable());
        $post->setTopic($topic);
        $post->setIdUser($user);

        $em->persist($post);
        $em->flush();

        return new JsonResponse([
            'success' => 'Post ajouté.',
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'createdAt' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $post->getIdUser()?->getId(),
                'username' => $post->getIdUser()?->getUsername(),
                'photo' => $post->getIdUser()?->getPhoto(),
            ],
        ], Response::HTTP_CREATED);
    }

    #[Route('/topic/{topicId}', name: 'list_by_topic', methods: ['GET'])]
    public function listPostsByTopic(
        int $topicId,
        PostRepository $postRepo
    ): JsonResponse {
        $posts = $postRepo->findBy(['topic' => $topicId]);

        $data = array_map(function (Post $post) {
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'createdAt' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $post->getIdUser()?->getId(),
                    'username' => $post->getIdUser()?->getUsername(),
                    'photo' => $post->getIdUser()?->getPhoto(),
                ],
            ];
        }, $posts);

        return new JsonResponse($data);
    }

    #[Route('/list-genre', name: 'list_all', methods: ['GET'])]
public function listAllPosts(PostRepository $postRepo): JsonResponse
{
    $posts = $postRepo->findAll();

    $data = array_map(function (Post $post) {
        return [
            'id' => $post->getId(),
            'content' => $post->getContent(),
            'createdAt' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $post->getIdUser()?->getId(),
                'username' => $post->getIdUser()?->getUsername(),
                'photo' => $post->getIdUser()?->getPhoto(),
            ],
            'topicId' => $post->getTopic()?->getId(),
            'topicTitle' => $post->getTopic()?->getTitle(),
            // Tu peux aussi ajouter le genre ici si besoin:
            'topicGenre' => $post->getTopic()?->getGenre()?->getName(),
        ];
    }, $posts);

    return new JsonResponse($data);
}

#[Route('/edit/{id}', name: 'edit', methods: ['PUT'])]
    public function editPost(
        int $id,
        Request $request,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager,
        Security $security
    ): JsonResponse {
        $post = $postRepository->find($id);
        if (!$post) {
            return $this->json(['error' => 'Post introuvable'], 404);
        }

        $user = $security->getUser();
        if (!$user) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        if ($post->getIdUser() !== $user && !in_array('ROLE_ADMIN', $user->getRoles())) {
            throw new AccessDeniedException('Vous ne pouvez pas modifier ce post.');
        }

        $data = json_decode($request->getContent(), true);
        $content = $data['content'] ?? null;

        if (!$content) {
            return $this->json(['error' => 'Le contenu est requis'], 400);
        }

        $post->setContent($content);
        $entityManager->flush();

        return $this->json([
            'message' => 'Post modifié avec succès',
            'post' => [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'createdAt' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            ],
        ]);
    }


#[Route('/delete/{id}', name: 'delete', methods: ['DELETE'])]
    public function deletePost(
        int $id,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager,
        Security $security
    ): JsonResponse {
        $post = $postRepository->find($id);
        if (!$post) {
            return $this->json(['error' => 'Post introuvable'], 404);
        }

        $user = $security->getUser();
        if (!$user) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        if ($post->getIdUser() !== $user && !in_array('ROLE_ADMIN', $user->getRoles())) {
            throw new AccessDeniedException('Vous ne pouvez pas supprimer ce post.');
        }

        $entityManager->remove($post);
        $entityManager->flush();

        return $this->json(['message' => 'Post supprimé avec succès']);
    }



}
