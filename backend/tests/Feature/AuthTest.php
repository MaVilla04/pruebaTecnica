<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_returns_user_and_token(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Juan',
            'email' => 'juan@example.com',
            'password' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email', 'role'], 'token']]);
    }

    public function test_login_returns_token(): void
    {
        $user = User::factory()->create(['email' => 'juan@example.com', 'password' => 'password123']);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'juan@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.user.email', 'juan@example.com')
            ->assertJsonStructure(['data' => ['token']]);
    }

    public function test_invalid_credentials_rejected(): void
    {
        User::factory()->create(['email' => 'juan@example.com', 'password' => 'password123']);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'juan@example.com',
            'password' => 'wrongpass',
        ]);

        $response->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors']);
    }

    public function test_me_requires_auth(): void
    {
        $this->getJson('/api/v1/me')->assertUnauthorized();

        $user = User::factory()->create();
        $this->actingAs($user)->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }
}
