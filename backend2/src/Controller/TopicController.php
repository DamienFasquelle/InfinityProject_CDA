<?php

namespace App\Controller;

use App\Entity\Topic;
use App\Repository\TopicRepository;
use App\Repository\PostRepository;
use App\Repository\TopicGenreRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;

#[Route('/api/topic', name: 'api_topic_')]
class TopicController extends AbstractController
{
    #[Route('/create', name: 'create', methods: ['POST'])]
    public function createTopic(
        Request $request,
        EntityManagerInterface $em,
        Security $security,
        TopicGenreRepository $genreRepo
    ): JsonResponse {
        $user = $security->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }

        // Récupération des données depuis multipart/form-data
        $title = $request->request->get('title');
        $description = $request->request->get('description');
        $genreId = $request->request->get('genre_id'); // attends "genre_id" côté frontend !
        $imageFile = $request->files->get('image');

        if (!$title) {
            return new JsonResponse(['error' => 'Le titre est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }
        if (!$genreId) {
            return new JsonResponse(['error' => 'Le genre est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }

        $genre = $genreRepo->find($genreId);
        if (!$genre) {
            return new JsonResponse(['error' => 'Genre introuvable.'], Response::HTTP_BAD_REQUEST);
        }

        $topic = new Topic();
        $topic->setTitle($title);
        $topic->setDescription($description);
        $topic->setCreatedAt(new \DateTimeImmutable());
        $topic->setIdUser($user);
        $topic->setGenre($genre);

        if ($imageFile) {
            $filename = uniqid() . '.' . $imageFile->guessExtension();
            $topicsPhotosDirectory = $this->getParameter('topics_photos_directory');
            $imageFile->move($topicsPhotosDirectory, $filename);
            $topic->setImage('/uploads/topics_photos/' . $filename);
        }

        $em->persist($topic);
        $em->flush();

        return new JsonResponse([
            'success' => 'Topic créé avec succès.',
            'id' => $topic->getId(),
            'title' => $topic->getTitle(),
            'description' => $topic->getDescription(),
            'image' => $topic->getImage(),
            'genre' => $genre->getName(),
            'createdAt' => $topic->getCreatedAt()->format('Y-m-d H:i:s'),
            'user' => [
               'id' => $topic->getIdUser()?->getId(),
                'username' => $topic->getIdUser()?->getUsername(),
                'photo' => $topic->getIdUser()?->getPhoto(),
            ],
        ], Response::HTTP_CREATED);
    }

    #[Route('/list', name: 'list', methods: ['GET'])]
    public function listTopics(TopicRepository $topicRepo): JsonResponse
    {
        $topics = $topicRepo->findAll();

        $data = array_map(function (Topic $topic) {
            return [
                'id' => $topic->getId(),
                'title' => $topic->getTitle(),
                'description' => $topic->getDescription(),
                'image' => $topic->getImage(),
                'createdAt' => $topic->getCreatedAt()->format('Y-m-d H:i:s'),
                'genre' => [
                    'id' => $topic->getGenre()?->getId(),
                    'name' => $topic->getGenre()?->getName(),
                ],
                'user' => [
                    'id' => $topic->getIdUser()?->getId(),
                    'username' => $topic->getIdUser()?->getUsername(),
                    'photo' => $topic->getIdUser()?->getPhoto(),
                ],
            ];
        }, $topics);

        return new JsonResponse($data);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function deleteTopic(
        int $id,
        TopicRepository $topicRepo,
        EntityManagerInterface $em,
        Security $security
    ): JsonResponse {
        $user = $security->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }

        $topic = $topicRepo->find($id);
        if (!$topic) {
            return new JsonResponse(['error' => 'Topic introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($topic->getIdUser() !== $user) {
            return new JsonResponse(['error' => 'Non autorisé à supprimer ce topic.'], Response::HTTP_FORBIDDEN);
        }

        if ($topic->getImage()) {
            $topicsPhotosDirectory = $this->getParameter('topics_photos_directory');
            $imagePath = $topicsPhotosDirectory . '/' . basename($topic->getImage());
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        $em->remove($topic);
        $em->flush();

        return new JsonResponse(['success' => 'Topic supprimé.'], Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'get_with_posts', methods: ['GET'])]
    public function getTopicWithPosts(
        int $id,
        TopicRepository $topicRepo,
        PostRepository $postRepo
    ): JsonResponse {
        $topic = $topicRepo->find($id);
        if (!$topic) {
            return new JsonResponse(['error' => 'Topic introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $posts = $postRepo->findBy(['topic' => $topic]);

        $postsData = array_map(function ($post) {
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

        return new JsonResponse([
            'id' => $topic->getId(),
            'title' => $topic->getTitle(),
            'description' => $topic->getDescription(),
            'image' => $topic->getImage(),
            'createdAt' => $topic->getCreatedAt()->format('Y-m-d H:i:s'),
            'genre' => [
                'id' => $topic->getGenre()?->getId(),
                'name' => $topic->getGenre()?->getName(),
            ],
            'user' => [
                'id' => $topic->getIdUser()?->getId(),
                'username' => $topic->getIdUser()?->getUsername(),
                'photo' => $topic->getIdUser()?->getPhoto(),
            ],
            'messages' => $postsData,
        ]);
    }
}
