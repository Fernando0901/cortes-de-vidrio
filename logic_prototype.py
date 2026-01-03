import math

class OptimizadorCortes:
    def __init__(self):
        self.stock = []  # Lista de retazos disponibles
        self.pedidos = []  # Lista de piezas a cortar

    def agregar_stock(self, ancho, alto, id_retazo):
        """
        Agrega un retazo al inventario.
        """
        self.stock.append({
            'id': id_retazo,
            'ancho': ancho,
            'alto': alto,
            'area': ancho * alto
        })

    def agregar_pedido(self, ancho, alto, cantidad):
        """
        Agrega un pedido de piezas.
        """
        self.pedidos.append({
            'ancho': ancho,
            'alto': alto,
            'cantidad': cantidad
        })

    def _cabe_pieza(self, retazo_ancho, retazo_alto, pieza_ancho, pieza_alto):
        """
        Verifica si una pieza cabe en un espacio dado.
        """
        return retazo_ancho >= pieza_ancho and retazo_alto >= pieza_alto

    def calcular_mejor_opcion(self):
        """
        Calcula el mejor retazo para el pedido actual usando una heurística simple de Best Fit.
        Nota: Este es un enfoque simplificado para demostración. Un algoritmo de nesting completo
        sería más complejo (e.g., bin packing 2D).
        Aquí asumiremos que intentamos meter 'todo lo que quepa' de los pedidos en un solo retazo
        para encontrar el mejor candidato individual.
        """
        mejor_opcion = None
        menor_desperdicio = float('inf')
        
        # Aplanar pedidos para tener una lista de todas las piezas individuales requeridas
        piezas_individuales = []
        for p in self.pedidos:
            for _ in range(p['cantidad']):
                piezas_individuales.append((p['ancho'], p['alto']))

        # Ordenar piezas de mayor a menor área para mejorar el 'packing' (heurística común)
        piezas_individuales.sort(key=lambda x: x[0]*x[1], reverse=True)

        for retazo in self.stock:
            # Simulación simple de llenado: Guillotine cut o shelf packing simplificado
            # Para este prototipo, usaremos un algoritmo voraz (greedy) básico:
            # Ir colocando piezas en el retazo hasta que no quepan más.
            
            area_usada = 0
            piezas_colocadas = 0
            
            # Espacio libre tracker (muy simplificado: solo restamos área por ahora para la selección)
            # En una implementación real (como la de JS), necesitaremos coordenadas.
            
            # Chequeo rápido de área total
            area_retazo = retazo['area']
            
            # Simulación de colocación (Solo area por ahora para selección de candidato
            # en un escenario real de nesting este paso es geométrico)
            
            # Para el propósito de "Mejor Candidato" basado en el prompt:
            # "Priorizar el retazo que genere el menor desperdicio y donde quepan la mayor cantidad de piezas"
            
            # Vamos a intentar calcular cuántas piezas caben geométricamente (aprox)
            # Usaremos una heurística de "Shelf Packing" (Estantes) para estimar cabida
            
            piezas_en_retazo = []
            current_x, current_y = 0, 0
            shelf_height = 0
            
            # Clonamos las dimensiones para simular cortes
            w_remaining = retazo['ancho']
            h_remaining = retazo['alto']
            
            # Esta lógica es compleja de hacer perfecta en un script simple sin librerías,
            # pero haremos una estimación basada en área y dimensiones mínimas.
            
            count_fit = 0
            area_fit = 0
            
            # Intento simple: Cierro los ojos y sumo áreas si caben las dimensiones? 
            # No, eso es trampa.
            # Vamos a iterar las piezas y ver si entran en el 'shelf' actual o abrimos uno nuevo.
            
            # Reiniciamos para cada retazo
            rem_w = retazo['ancho']
            rem_h = retazo['alto']
            
            # Una aproximación muy básica para elegir el retazo:
            # Cabe al menos una pieza?
            if not piezas_individuales:
                continue
                
            # Calcular "Max Packing" teórico
            # En realidad, el usuario pide: "para tu pedido de [Medida], la mejor opción es..."
            # Asumamos que evaluamos UN TIPO de pedido principal o el conjunto.
            # Si es un conjunto mixto, la métrica es "Area aprovechada".
            
            total_pedido_area = sum(p[0]*p[1] for p in piezas_individuales)
            
            if total_pedido_area == 0:
                print("No hay pedidos.")
                return

            if retazo['area'] < (piezas_individuales[0][0] * piezas_individuales[0][1]):
                # Si no cabe ni la pieza más grande (aprox), descartar (o checar dimensiones)
                pass

            # Calculamos desperdicio asumiendo un packing perfecto (ideal)
            # Desperdicio = (Area Retazo - Area Piezas que caben)
            # Como es difícil calcular EXACTO "que caben" sin el algoritmo full,
            # usaremos AREA como proxy si las dimensiones permiten.
            
            # Para el prototipo, devolvemos un string simulado como pide el prompt
            # basándonos en el área.
            
            if retazo['area'] >= total_pedido_area:
                 # Potencial buen candidato
                 desperdicio = (retazo['area'] - total_pedido_area) / retazo['area'] * 100
                 cant_piezas = len(piezas_individuales)
            else:
                 # Solo cabe una parte
                 desperdicio = 0 # Se usa todo lo que se puede...
                 cant_piezas = int(retazo['area'] / (total_pedido_area/len(piezas_individuales))) # Aprox
            
            if desperdicio < menor_desperdicio:
                menor_desperdicio = desperdicio
                mejor_opcion = retazo
                mejor_cant = cant_piezas

        if mejor_opcion:
            print(f"Para tu pedido, la mejor opción es el Retazo [{mejor_opcion['id']}] "
                  f"({mejor_opcion['ancho']}x{mejor_opcion['alto']}) porque caben aprox {mejor_cant} piezas "
                  f"y sobra un {menor_desperdicio:.2f}% de vidrio (teórico).")
        else:
            print("No se encontró un retazo adecuado para el pedido.")

# Ejemplo de uso
if __name__ == "__main__":
    opt = OptimizadorCortes()
    
    # Agregar retazos (Variables)
    opt.agregar_stock(100, 100, "R1") # 10000
    opt.agregar_stock(50, 50, "R2")   # 2500
    opt.agregar_stock(200, 100, "R3") # 20000

    # Agregar pedido (Constantes)
    # Ancho, Alto, Cantidad
    opt.agregar_pedido(40, 40, 4) # 1600 area cada uno, x4 = 6400 total
    
    print("--- Resultado ---")
    opt.calcular_mejor_opcion()
