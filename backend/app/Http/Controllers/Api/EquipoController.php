<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuardarEquipoRequest;
use App\Http\Resources\EquipoResource;
use App\Models\Equipo;
use App\Services\EquipoService;
use Illuminate\Http\Request;

class EquipoController extends Controller
{
    public function __construct(private EquipoService $service)
    {
    }

    public function index(Request $request)
    {
        $porPagina = max(1, min(50, (int) $request->input('per_page', 10)));

        return EquipoResource::collection($this->service->listar(
            $request->input('q'),
            $request->input('estado'),
            $porPagina
        ));
    }

    public function show(Equipo $equipo)
    {
        return new EquipoResource($equipo->load('categoria'));
    }

    public function store(GuardarEquipoRequest $request)
    {
        $equipo = $this->service->crear($request->validated());

        return (new EquipoResource($equipo))->response()
            ->setStatusCode(201)
            ->header('Location', route('equipos.show', $equipo));
    }

    public function update(GuardarEquipoRequest $request, Equipo $equipo)
    {
        return new EquipoResource(
            $this->service->actualizar($equipo, $request->validated())
        );
    }

    public function destroy(Equipo $equipo)
    {
        $this->service->eliminar($equipo);

        return response()->noContent();
    }

    public function prestar(Equipo $equipo)
    {
        return new EquipoResource($this->service->prestar($equipo));
    }
}
