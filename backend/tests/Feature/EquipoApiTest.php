<?php

use App\Models\Categoria;
use App\Models\Equipo;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/*
| TODO [B6] Escriba las tres pruebas. Cada una debe verificar el código
| de estado Y algo más (estructura, encabezado, mensaje o estado de la base).
|
| Quite el ->todo() de cada prueba al implementarla.
| Ejecute:  php artisan test --filter=EquipoApi
*/

beforeEach(function () {
    Sanctum::actingAs(User::factory()->create());
});

it('crea un equipo y responde 201 con el encabezado Location', function () {
    $categoria = Categoria::factory()->create();

    $respuesta = $this->postJson('/api/equipos', [
        'codigo' => 'EQ-9000',
        'nombre' => 'Laptop de laboratorio',
        'categoria_id' => $categoria->id,
        'fecha_adquisicion' => today()->toDateString(),
        'costo_interno' => 100000,
    ]);

    $respuesta->assertCreated()
        ->assertHeader(
            'Location',
            route('equipos.show', $respuesta->json('data.id'))
        )
        ->assertJsonPath('data.codigo', 'EQ-9000');

    $this->assertDatabaseHas('equipos', [
        'codigo' => 'EQ-9000'
    ]);
});

it('rechaza un equipo con datos inválidos y responde 422 con errores por campo', function () {
    $this->postJson('/api/equipos', [
        'codigo' => 'MAL',
        'nombre' => 'A',
        'categoria_id' => 9999,
        'estado' => 'prestado',
        'fecha_adquisicion' => today()->addDay()->toDateString(),
        'costo_interno' => -1,
    ])
    ->assertUnprocessable()
    ->assertJsonValidationErrors([
        'codigo',
        'nombre',
        'categoria_id',
        'estado',
        'fecha_adquisicion',
        'costo_interno',
    ]);
});

it('impide eliminar un equipo prestado y responde 409', function () {
    $equipo = Equipo::factory()->prestado()->create();

    $this->deleteJson(route('equipos.destroy', $equipo))
        ->assertConflict()
        ->assertJson([
            'mensaje' => 'No se puede eliminar un equipo prestado.',
            'codigo' => 'REGLA_NEGOCIO',
        ]);

    $this->assertDatabaseHas('equipos', [
        'id' => $equipo->id
    ]);
});