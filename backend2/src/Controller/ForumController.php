<?php

namespace App\Controller;

use App\Entity\Topic;
use App\Entity\Post;
use App\Repository\TopicRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class ForumController extends AbstractController
{
    #[Route('/api/topics', name: 'list_topics', methods: ['GET'])]
    public function listTopics(TopicRepository $topicRepository): JsonResponse
    {
        $topics = $topicRepository->findAll();

        $data = array_map(function (Topic $topic) {
            return [
                'id' => $topic->getId(),
                'title' => $topic->getTitle(),
                'createdAt' => $topic->getCreatedAt()->format('Y-m-d H:i:s'),
                'author' => $topic->getIdUser()?->getUsername(),
            ];
        }, $topics);

        return $this->json($data);
    }

    #[Route('/api/topics', name: 'create_topic', methods: ['POST'])]
    public function createTopic(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            throw new AccessDeniedException('Vous devez être connecté pour créer un topic.');
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['title']) || empty($data['content'])) {
            return $this->json(['message' => 'Titre et contenu requis.'], 400);
        }

        $topic = new Topic();
        $topic->setTitle($data['title']);
        $topic->setIdUser($user);
        $topic->setCreatedAt(new \DateTimeImmutable());

        $post = new Post();
        $post->setContent($data['content']);
        $post->setIdUser($user);
        $post->setTopic($topic);
        $post->setCreatedAt(new \DateTimeImmutable());

        $em->persist($topic);
        $em->persist($post);
        $em->flush();

        return $this->json([
            'message' => 'Topic créé avec succès.',
            'topicId' => $topic->getId(),
        ], 201);
    }

    #[Route('/api/topics/{id}', name: 'get_topic', methods: ['GET'])]
    public function getTopic(int $id, TopicRepository $topicRepository): JsonResponse
    {
        $topic = $topicRepository->find($id);

        if (!$topic) {
            return $this->json(['message' => 'Topic non trouvé.'], 404);
        }

        $posts = $topic->getPosts();

        $postsData = array_map(function ($post) {
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'author' => $post->getIdUser()?->getUsername(),
                'createdAt' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $posts->toArray());

        return $this->json([
            'id' => $topic->getId(),
            'title' => $topic->getTitle(),
            'author' => $topic->getIdUser()?->getUsername(),
            'createdAt' => $topic->getCreatedAt()->format('Y-m-d H:i:s'),
            'posts' => $postsData,
        ]);
    }

    #[Route('/api/topics/{id}/posts', name: 'add_post', methods: ['POST'])]
    public function addPost(int $id, Request $request, TopicRepository $topicRepository, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            throw new AccessDeniedException('Vous devez être connecté pour poster.');
        }

        $topic = $topicRepository->find($id);

        if (!$topic) {
            return $this->json(['message' => 'Topic non trouvé.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['content'])) {
            return $this->json(['message' => 'Le contenu du post est requis.'], 400);
        }

        $post = new Post();
        $post->setContent($data['content']);
        $post->setIdUser($user);
        $post->setTopic($topic);
        $post->setCreatedAt(new \DateTimeImmutable());

        $em->persist($post);
        $em->flush();

        return $this->json([
            'message' => 'Post ajouté avec succès.',
            'postId' => $post->getId(),
        ], 201);
    }
}
