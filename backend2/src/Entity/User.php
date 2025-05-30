<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var array<string> The user roles
     */
    #[ORM\Column(type: 'json')]
    private array $roles = ['ROLE_USER'];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 65)]
    private ?string $username = null;

    /**
     * @var Collection<int, Comment>
     */
    #[ORM\OneToMany(targetEntity: Comment::class, mappedBy: 'idUser')]
    private Collection $comments;

    /**
     * @var Collection<int, FavoriteGame>
     */
    #[ORM\OneToMany(targetEntity: FavoriteGame::class, mappedBy: 'user', cascade: ['persist', 'remove'])]
    private Collection $favoriteGames;

    public function __construct()
    {
        $this->comments = new ArrayCollection();
        $this->favoriteGames = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     * @return list<string>
     */
    public function getRoles(): array
{
    $roles = $this->roles;

    // Ne pas ajouter ROLE_USER si ce rôle est déjà attribué
    if (!in_array('ROLE_USER', $roles)) {
        $roles[] = 'ROLE_USER';
    }

    return array_unique($roles);
}


    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // $this->plainPassword = null;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    /**
     * @return Collection<int, Comment>
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(Comment $comment): static
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
            $comment->setIdUser($this);
        }

        return $this;
    }

    public function removeComment(Comment $comment): static
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getIdUser() === $this) {
                $comment->setIdUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, FavoriteGame>
     */
    public function getFavoriteGames(): Collection
    {
        return $this->favoriteGames;
    }

    public function addFavoriteGame(FavoriteGame $favoriteGame): static
    {
        if (!$this->favoriteGames->contains($favoriteGame)) {
            $this->favoriteGames->add($favoriteGame);
            $favoriteGame->setUser($this);
        }

        return $this;
    }

    public function removeFavoriteGame(FavoriteGame $favoriteGame): static
    {
        if ($this->favoriteGames->removeElement($favoriteGame)) {
            // set the owning side to null (unless already changed)
            if ($favoriteGame->getUser() === $this) {
                $favoriteGame->setUser(null);
            }
        }

        return $this;
    }
}
