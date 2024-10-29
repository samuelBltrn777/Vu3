<template>
  <div class="p-8 overflow-x-auto w-full">
    <h2>Nombre Proyecto: {{ proyectoActual?.nombre }}</h2>

    <div class="mt-4">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <input 
            v-model="nuevaTarea" 
            type="text" 
            placeholder="Agregar nueva tarea" 
            class="input input-bordered w-full"
            :disabled="!puedeAgregarTareas"
          />
        </div>
        <button 
          @click="agregarTarea" 
          class="btn btn-primary"
          :disabled="!puedeAgregarTareas"
        >
          Agregar
        </button>
      </div>

      <!-- Contador de tareas -->
      <div class="mt-2 text-sm" :class="{'text-error': !puedeAgregarTareas}">
        Tareas: {{ proyectoActual?.tareas.length || 0 }} / {{ proyectosStore.MAX_TAREAS }}
      </div>

      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="alert alert-error mt-2">
        {{ errorMessage }}
      </div>
    </div>

    <table class="table mt-4">
      <thead>
        <tr>
          <th>#</th>
          <th>Completada</th>
          <th>Tarea</th>
          <th>Fecha y hora de Registro</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tarea, index) in proyectoActual?.tareas" :key="tarea.id">
          <td>{{ index + 1 }}</td>
          <td>
            <input
              type="checkbox"
              :checked="tarea.completada"
              @change="toggleTarea(tarea.id)"
            />
          </td>
          <td>
            <div v-if="tareaEditandoId === tarea.id" class="flex gap-2">
              <input 
                v-model="tareaEditando" 
                type="text" 
                class="input input-bordered input-sm"
                @keyup.enter="guardarEdicion(tarea.id)"
              />
              <button @click="guardarEdicion(tarea.id)" class="btn btn-sm btn-primary">
                Guardar
              </button>
              <button @click="cancelarEdicion" class="btn btn-sm">
                Cancelar
              </button>
            </div>
            <span v-else>{{ tarea.nombre }}</span>
          </td>
          <td>
            {{ new Date(Number(tarea.id)).toLocaleString() }}
          </td>
          <td>
            <div class="flex gap-2">
              <button 
                @click="iniciarEdicion(tarea.id, tarea.nombre)"
                class="btn btn-sm btn-info"
                v-if="tareaEditandoId !== tarea.id"
              >
                Editar
              </button>
              <button 
                @click="eliminarTarea(tarea.id)"
                class="btn btn-sm btn-error"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4">
      <label>Progreso del proyecto:</label>
      <div class="flex items-center gap-2">
        <progress 
          :value="proyectoActual?.progreso" 
          class="progress progress-secondary flex-1" 
          max="100"
        ></progress>
        <span>{{ proyectoActual?.progreso }}%</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProyectosStore } from '../store/projects.store';

const proyectosStore = useProyectosStore();
const route = useRoute();
const nuevaTarea = ref('');
const errorMessage = ref('');
const tareaEditandoId = ref('');
const tareaEditando = ref('');

const proyectoActual = computed(() =>
  proyectosStore.proyectos.find((proyecto) => proyecto.id === route.params.id)
);

const puedeAgregarTareas = computed(() => 
  proyectosStore.puedeAgregarTareas(route.params.id as string)
);

const agregarTarea = () => {
  if (nuevaTarea.value.trim() !== '') {
    const resultado = proyectosStore.agregarTarea(route.params.id as string, nuevaTarea.value.trim());
    
    if (resultado.success) {
      nuevaTarea.value = '';
      errorMessage.value = '';
    } else {
      errorMessage.value = resultado.message;
    }
  }
};

const toggleTarea = (idTarea: string) => {
  proyectosStore.toggleTareaCompletada(route.params.id as string, idTarea);
};

const iniciarEdicion = (idTarea: string, nombreTarea: string) => {
  tareaEditandoId.value = idTarea;
  tareaEditando.value = nombreTarea;
};

const cancelarEdicion = () => {
  tareaEditandoId.value = '';
  tareaEditando.value = '';
};

const guardarEdicion = (idTarea: string) => {
  if (tareaEditando.value.trim() !== '') {
    const resultado = proyectosStore.editarTarea(
      route.params.id as string,
      idTarea,
      tareaEditando.value.trim()
    );
    
    if (resultado.success) {
      cancelarEdicion();
      errorMessage.value = '';
    } else {
      errorMessage.value = resultado.message;
    }
  }
};

const eliminarTarea = (idTarea: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
    const resultado = proyectosStore.eliminarTarea(route.params.id as string, idTarea);
    
    if (!resultado.success) {
      errorMessage.value = resultado.message;
    }
  }
};
</script>