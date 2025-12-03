import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../config/Firebase";

export async function ensureCollectionExists(name) {
  try {
    const ref = collection(db, name);
    const snap = await getDocs(ref);

    // Se já existe algo, não cria nada
    if (!snap.empty) return;

    // Criar documento inicial seguro para "financeiro"
    if (name === "financeiro") {
      await addDoc(ref, {
        tipo: "Receita",
        valor: 0,
        descricao: "Inicial",
        formaPagamento: "Pix",
        data: Timestamp.now()
      });
      return;
    }

    // Criar documento inicial seguro para "agendamentos"
    if (name === "agendamentos") {
      await addDoc(ref, {
        nome: "Inicial",
        data: Timestamp.now(),
        hora: "00:00",
        serv: "Inicial",
        observacoes: ""
      });
      return;
    }

  } catch (err) {
    console.error("ensureCollectionExists error:", err);
    throw err;
  }
}
