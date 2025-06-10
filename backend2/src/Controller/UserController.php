<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\String\Slugger\SluggerInterface;

class UserController extends AbstractController
{
    #[Route('/api/users', name: 'get_all_users', methods: ['GET'])]
    public function getAllUsers(UserRepository $userRepository): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $users = $userRepository->findAll();
        if (!$users) {
            return $this->json(['message' => 'Aucun utilisateur trouvé.'], 404);
        }

        $usersData = array_map(fn($user) => [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ], $users);

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
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $username = $request->query->get('username');
        if (!$username) {
            return $this->json(['message' => 'Aucun nom d\'utilisateur spécifié.'], 400);
        }

        $users = $userRepository->findBy(['username' => $username]);
        if (!$users) {
            return $this->json(['message' => 'Aucun utilisateur trouvé avec ce nom.'], 404);
        }

        $usersData = array_map(fn($user) => [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ], $users);

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
        $commentsData = array_map(fn($comment) => [
            'id' => $comment->getId(),
            'content' => $comment->getContent(),
            'rating' => $comment->getRating(),
            'created_at' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
            'gameId' => $comment->getIdGames(),
        ], $comments->toArray());

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'photo' => $user->getPhoto(),
            ],
            'comments' => $commentsData,
        ]);
    }

    #[Route('/api/users', name: 'create_user', methods: ['POST'])]
    public function createUser(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $data = json_decode($request->getContent(), true);
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            return $this->json(['message' => 'Les données sont incomplètes.'], 400);
        }

        if (!$this->isPasswordStrong($data['password'])) {
            return $this->json(['message' => 'Le mot de passe est trop faible.'], 400);
        }

        $user = new User();
        $user->setUsername($data['username']);
        $user->setEmail($data['email']);
        $user->setPassword($passwordHasher->hashPassword($user, $data['password']));
        $user->setRoles(['ROLE_USER']);

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ], 201);
    }

    #[Route('/api/users/{id}', name: 'update_user', methods: ['PUT'])]
    public function updateUser(
        int $id,
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['message' => 'Données invalides.'], 400);
        }

        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }

        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (isset($data['password'])) {
            if (!$this->isPasswordStrong($data['password'])) {
                return $this->json(['message' => 'Le mot de passe est trop faible.'], 400);
            }
            $user->setPassword($passwordHasher->hashPassword($user, $data['password']));
        }

        $entityManager->flush();

        return $this->json(['message' => 'Utilisateur mis à jour avec succès.']);
    }

    #[Route('/api/users/{id}', name: 'delete_user', methods: ['DELETE'])]
    public function deleteUser(
        int $id,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

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

        $photo = $request->files->get('photo');
        if (!$photo) {
            return $this->json(['message' => 'Aucun fichier envoyé.'], 400);
        }

        $filename = $slugger->slug(pathinfo($photo->getClientOriginalName(), PATHINFO_FILENAME)) . '-' . uniqid() . '.' . $photo->guessExtension();

        try {
            $photo->move($this->getParameter('user_photos_directory'), $filename);
        } catch (FileException) {
            return $this->json(['message' => 'Erreur lors de l’upload de la photo.'], 500);
        }

        $user->setPhoto($filename);
        $entityManager->flush();

        return $this->json(['message' => 'Photo mise à jour avec succès.', 'filename' => $filename]);
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

        $photo = $request->files->get('photo');
        if (!$photo) {
            return $this->json(['message' => 'Aucun fichier envoyé.'], 400);
        }

        if ($user->getPhoto()) {
            $oldPath = $this->getParameter('user_photos_directory') . '/' . $user->getPhoto();
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }

        $filename = $slugger->slug(pathinfo($photo->getClientOriginalName(), PATHINFO_FILENAME)) . '-' . uniqid() . '.' . $photo->guessExtension();

        try {
            $photo->move($this->getParameter('user_photos_directory'), $filename);
        } catch (FileException) {
            return $this->json(['message' => 'Erreur lors de l’upload de la nouvelle photo.'], 500);
        }

        $user->setPhoto($filename);
        $em->flush();

        return $this->json(['message' => 'Photo mise à jour avec succès.', 'filename' => $filename]);
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

        $path = $this->getParameter('user_photos_directory') . '/' . $user->getPhoto();
        if (file_exists($path)) {
            unlink($path);
        }

        $user->setPhoto(null);
        $em->flush();

        return $this->json(['message' => 'Photo supprimée avec succès.']);
    }

    private function isPasswordStrong(string $password): bool
    {
        return strlen($password) >= 8 &&
            preg_match('/[A-Z]/', $password) &&
            preg_match('/[a-z]/', $password) &&
            preg_match('/[0-9]/', $password) &&
            preg_match('/[\W]/', $password);
    }
}
