import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/Firebase';

/**
 * Retorna true se a coleção estiver vazia. Usa getCountFromServer quando possível
 * e faz fallback para uma query com limit(1) para reduzir custo.
 */
export async function isCollectionEmpty(collName) {
  const collRef = collection(db, collName);

  try {
    const snapshot = await getCountFromServer(collRef);
    const count = (snapshot && snapshot.data && snapshot.data().count) || 0;
    return count === 0;
  } catch (err) {
    // fallback: consulta apenas 1 documento
    try {
      const snap = await getDocs(query(collRef, limit(1)));
      return snap.empty === true || (snap.size === 0);
    } catch (err2) {
      console.error('isCollectionEmpty error:', err, err2);
      // Se não for possível determinar, considere vazio para segurança
      return true;
    }
  }
}

/**
 * Garante que a coleção exista criando um documento padrão quando vazia.
 * Retorna true se criou um documento, false se já existia ou em caso de erro.
 */
export async function ensureCollectionExists(name) {
  try {
    const empty = await isCollectionEmpty(name);
    if (!empty) return false;

    const ref = collection(db, name);

    if (name === 'financeiro') {
      await addDoc(ref, {
        tipo: 'Receita',
        valor: 0,
        descricao: 'Inicial',
        // salve também um timestamp para compatibilidade com outros lugares
        data: Timestamp.fromDate(new Date())
      });
      return true;
    }

    if (name === 'agendamentos') {
      await addDoc(ref, {
        nome: 'Inicial',
        data: '2025-01-01',
        hora: '00:00',
        serv: 'Inicial',
        observacoes: ''
      });
      return true;
    }

    // para outras coleções, cria um doc vazio
    await addDoc(ref, { _init: true, createdAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('ensureCollectionExists error:', error);
    return false;
  }
}

export default ensureCollectionExists;
