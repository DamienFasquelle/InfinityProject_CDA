<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\String\Slugger\SluggerInterface;
use Doctrine\ORM\EntityManagerInterface;

class UserController extends AbstractController
{
    #[Route('/api/users', name: 'get_all_users', methods: ['GET'])]
    public function getAllUsers(UserRepository $userRepository): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException('Accès interdit, vous devez être administrateur.');
        }

        $users = $userRepository->findAll();

        if (!$users) {
            return $this->json(['message' => 'Aucun utilisateur trouvé.'], 404);
        }

        $usersData = array_map(function ($user) {
            return [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
            ];
        }, $users);

        return $this->json($usersData);
    }

    #[Route('/api/users/{id}', name: 'get_user_by_id', methods: ['GET'])]
    public function getUserById(int $id, UserRepository $userRepository): JsonResponse
    {

        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'photo' => $user->getPhoto(),
        ]);
    }

    #[Route('/api/users/search', name: 'search_users', methods: ['GET'])]
    public function searchUsers(Request $request, UserRepository $userRepository): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException('Accès interdit, vous devez être administrateur.');
        }

        $username = $request->query->get('username');
        if (!$username) {
            return $this->json(['message' => 'Aucun nom d\'utilisateur spécifié.'], 400);
        }

        $users = $userRepository->findBy(['username' => $username]);

        if (!$users) {
            return $this->json(['message' => 'Aucun utilisateur trouvé avec ce nom.'], 404);
        }

        $usersData = array_map(function ($user) {
            return [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
            ];
        }, $users);

        return $this->json($usersData);
    }

    #[Route('/api/users/{userId}/comments', name: 'get_user_comments', methods: ['GET'])]
    public function getUserComments(int $userId, UserRepository $userRepository): JsonResponse
    {

        $user = $userRepository->find($userId);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        $comments = $user->getComments();

        if ($comments->isEmpty()) {
            return $this->json(['message' => 'Aucun commentaire trouvé pour cet utilisateur.'], 404);
        }

        $commentsData = array_map(function ($comment) {
            return [
                'id' => $comment->getId(),
                'content' => $comment->getContent(),
                'rating' => $comment->getRating(),
                'created_at' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
                'gameId' => $comment->getIdGames()
                
            ];
        }, $comments->toArray());

        return $this->json($commentsData);
    }

    #[Route('/api/users', name: 'create_user', methods: ['POST'])]
public function createUser(Request $request, EntityManagerInterface $entityManager): JsonResponse
{
    if (!$this->isGranted('ROLE_ADMIN')) {
        throw new AccessDeniedException('Accès interdit, vous devez être administrateur.');
    }

    $data = json_decode($request->getContent(), true);

    if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
        return $this->json(['message' => 'Les données sont incomplètes.'], 400);
    }

    $user = new User();
    $user->setUsername($data['username']);
    $user->setEmail($data['email']);
    $user->setPassword(password_hash($data['password'], PASSWORD_BCRYPT));
    $user->setRoles(['ROLE_USER']); 

    $entityManager->persist($user);
    $entityManager->flush();

    // Renvoi les données de l'utilisateur créé (id, username, email, roles)
    return $this->json([
        'id' => $user->getId(),
        'username' => $user->getUsername(),
        'email' => $user->getEmail(),
        'roles' => $user->getRoles(),
    ], 201);
}


    #[Route('/api/users/{id}', name: 'update_user', methods: ['PUT'])]
    public function updateUser(int $id, Request $request, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {

        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }
        if (isset($data['password'])) {
            $user->setPassword(password_hash($data['password'], PASSWORD_BCRYPT));
        }

        $entityManager->flush();

        return $this->json(['message' => 'Utilisateur mis à jour avec succès.']);
    }

    #[Route('/api/users/{id}', name: 'delete_user', methods: ['DELETE'])]
    public function deleteUser(int $id, UserRepository $userRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException('Accès interdit, vous devez être administrateur.');
        }

        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(['message' => 'Utilisateur supprimé avec succès.']);
    }
    #[Route('/api/users/{id}/upload-photo', name: 'upload_user_photo', methods: ['POST'])]
    public function uploadUserPhoto(
        int $id,
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        /** @var UploadedFile $photo */
        $photo = $request->files->get('photo');

        if (!$photo) {
            return $this->json(['message' => 'Aucun fichier envoyé.'], 400);
        }

        $originalFilename = pathinfo($photo->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalFilename);
        $newFilename = $safeFilename . '-' . uniqid() . '.' . $photo->guessExtension();

        try {
            $photo->move(
                $this->getParameter('user_photos_directory'), 
                $newFilename
            );
        } catch (FileException $e) {
            return $this->json(['message' => 'Erreur lors de l’upload de la photo.'], 500);
        }

        $user->setPhoto($newFilename);
        $entityManager->flush();

        return $this->json(['message' => 'Photo mise à jour avec succès.', 'filename' => $newFilename]);
    }
    #[Route('/api/users/{id}/photo', name: 'update_user_photo', methods: ['PUT'])]
    public function updateUserPhoto(
        int $id,
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        SluggerInterface $slugger
    ): JsonResponse {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        /** @var UploadedFile $photo */
        $photo = $request->files->get('photo');

        if (!$photo) {
            return $this->json(['message' => 'Aucun fichier envoyé.'], 400);
        }

        // Supprimer l'ancienne photo si elle existe
        if ($user->getPhoto()) {
            $oldPath = $this->getParameter('user_photos_directory') . '/' . $user->getPhoto();
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }

        $originalFilename = pathinfo($photo->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalFilename);
        $newFilename = $safeFilename . '-' . uniqid() . '.' . $photo->guessExtension();

        try {
            $photo->move(
                $this->getParameter('user_photos_directory'),
                $newFilename
            );
        } catch (FileException $e) {
            return $this->json(['message' => 'Erreur lors de l’upload de la nouvelle photo.'], 500);
        }

        $user->setPhoto($newFilename);
        $em->flush();

        return $this->json(['message' => 'Photo mise à jour avec succès.', 'filename' => $newFilename]);
    }

    #[Route('/api/users/{id}/photo', name: 'delete_user_photo', methods: ['DELETE'])]
    public function deleteUserPhoto(
        int $id,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        if (!$user->getPhoto()) {
            return $this->json(['message' => 'Aucune photo à supprimer.'], 400);
        }

        $filePath = $this->getParameter('user_photos_directory') . '/' . $user->getPhoto();

        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $user->setPhoto(null);
        $em->flush();

        return $this->json(['message' => 'Photo supprimée avec succès.']);
    }
    }
