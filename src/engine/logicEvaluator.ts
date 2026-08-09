/**
 * Evaluador lógico seguro (Regex-based).
 * Interpreta strings del estilo:
 * "score.puntos_ciencia >= 10"
 * "inventory.has(llave_usb)"
 * "flag.visitado_lab == true"
 */
export const evaluateCondition = (
  condition: string,
  scores: Record<string, number>,
  flags: Record<string, boolean>,
  inventory: string[]
): boolean => {
  if (!condition || condition.trim() === '') return true; // Si no hay condición, pasa por defecto

  const cleanCond = condition.trim().replace(/\s+/g, '');

  try {
    // 1. Evaluar Inventario: inventory.has(item)
    const invMatch = cleanCond.match(/^inventory\.has\(([^)]+)\)$/);
    if (invMatch) {
      return inventory.includes(invMatch[1]);
    }

    // 2. Evaluar Scores: score.key >= valor
    // Soporta: >=, <=, >, <, ==
    const scoreMatch = cleanCond.match(/^score\.([a-zA-Z0-9_]+)(>=|<=|>|<|==)([0-9]+)$/);
    if (scoreMatch) {
      const key = scoreMatch[1];
      const operator = scoreMatch[2];
      const targetVal = parseFloat(scoreMatch[3]);
      const currentVal = scores[key] || 0;

      switch (operator) {
        case '>=': return currentVal >= targetVal;
        case '<=': return currentVal <= targetVal;
        case '>': return currentVal > targetVal;
        case '<': return currentVal < targetVal;
        case '==': return currentVal === targetVal;
      }
    }

    // 3. Evaluar Flags booleanas: flag.key == true/false
    const flagMatch = cleanCond.match(/^flag\.([a-zA-Z0-9_]+)(==|!=)(true|false)$/);
    if (flagMatch) {
      const key = flagMatch[1];
      const operator = flagMatch[2];
      const targetBool = flagMatch[3] === 'true';
      const currentBool = flags[key] || false;

      if (operator === '==') return currentBool === targetBool;
      if (operator === '!=') return currentBool !== targetBool;
    }

    // Si no hace match con la sintaxis estricta, denegar acceso por seguridad
    console.warn(`Condition format not recognized or invalid: ${condition}`);
    return false;
  } catch (e) {
    console.error("Error evaluating condition:", e);
    return false;
  }
};
