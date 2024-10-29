import { defineStore } from 'pinia';

interface Tarea {
  id: string;
  nombre: string;
  completada: boolean;
}

interface Proyecto {
  id: string;
  nombre: string;
  tareas: Tarea[];
  progreso: number;
}

export const useProyectosStore = defineStore('proyectos', {
   state: () => ({
    proyectos: [] as Proyecto[],
    MAX_TAREAS: 10 // Constante para el límite de tareas
   }),
   getters: {
    puedeAgregarTareas: (state) => {
      return (proyectoId: string) => {
        const proyecto = state.proyectos.find(p => p.id === proyectoId);
        return proyecto ? proyecto.tareas.length < state.MAX_TAREAS : false;
      }
    }
   },
   actions: {
    agregarProyecto(nombreProyecto: string) {
        const proyecto = { 
            id: Date.now().toString(), 
            nombre: nombreProyecto, 
            tareas: [], 
            progreso: 0 
        };
        this.proyectos.push(proyecto);
        return proyecto;
    },
    agregarTarea(idProyecto: string, nombreTarea: string): { success: boolean; message: string } {
        const proyecto = this.proyectos.find((proyecto) => proyecto.id === idProyecto);
        if (!proyecto) {
          return { success: false, message: 'Proyecto no encontrado' };
        }

        if (proyecto.tareas.length >= this.MAX_TAREAS) {
          return { success: false, message: `No se pueden agregar más tareas. Límite de ${this.MAX_TAREAS} alcanzado.` };
        }

        proyecto.tareas.push({
          id: Date.now().toString(),
          nombre: nombreTarea,
          completada: false,
        });
        this.calcularProgreso(idProyecto);
        return { success: true, message: 'Tarea agregada exitosamente' };
    },
    editarTarea(idProyecto: string, idTarea: string, nuevoNombre: string): { success: boolean; message: string } {
        const proyecto = this.proyectos.find((p) => p.id === idProyecto);
        if (!proyecto) {
          return { success: false, message: 'Proyecto no encontrado' };
        }

        const tarea = proyecto.tareas.find((t) => t.id === idTarea);
        if (!tarea) {
          return { success: false, message: 'Tarea no encontrada' };
        }

        tarea.nombre = nuevoNombre;
        return { success: true, message: 'Tarea actualizada exitosamente' };
    },
    eliminarTarea(idProyecto: string, idTarea: string): { success: boolean; message: string } {
        const proyecto = this.proyectos.find((p) => p.id === idProyecto);
        if (!proyecto) {
          return { success: false, message: 'Proyecto no encontrado' };
        }

        const tareaIndex = proyecto.tareas.findIndex((t) => t.id === idTarea);
        if (tareaIndex === -1) {
          return { success: false, message: 'Tarea no encontrada' };
        }

        proyecto.tareas.splice(tareaIndex, 1);
        this.calcularProgreso(idProyecto);
        return { success: true, message: 'Tarea eliminada exitosamente' };
    },
    toggleTareaCompletada(idProyecto: string, idTarea: string) {
        const proyecto = this.proyectos.find((p) => p.id === idProyecto);
        if (proyecto) {
            const tarea = proyecto.tareas.find((t) => t.id === idTarea);
            if (tarea) {
                tarea.completada = !tarea.completada;
                this.calcularProgreso(idProyecto);
            }
        }
    },
    calcularProgreso(idProyecto: string) {
        const proyecto = this.proyectos.find((p) => p.id === idProyecto);
        if (proyecto) {
            const totalTareas = proyecto.tareas.length;
            if (totalTareas === 0) {
                proyecto.progreso = 0;
                return;
            }
            
            const tareasCompletadas = proyecto.tareas.filter(t => t.completada).length;
            proyecto.progreso = Math.round((tareasCompletadas / totalTareas) * 100);
        }
    }
   } 
});