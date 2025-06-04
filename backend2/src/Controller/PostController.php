<?php

namespace App\Controller;

use App\Entity\Post;
use App\Repository\PostRepository;
use App\Repository\TopicRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
}
