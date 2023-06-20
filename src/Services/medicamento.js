import AsyncStorage from "@react-native-async-storage/async-storage";
import { entregaDados } from "./notification";

var SalvarMedicamento = async (prop) => {
  let storage;

  try {
    storage = await AsyncStorage.getItem("@Remediario:Medicamentos");
  } catch (e) {
    console.log(e);
  }

  if (storage == null) {
    storage = {
      data: [],
    };
  } else {
    storage = JSON.parse(storage);
  }

  let nomeRemedio = storage.data.find(
    (nome) => nome.nomeRemedio === prop.nomeRemedio
  );

  if (nomeRemedio) {
    throw new Error(
      'Já existe um remédio com esse nome: ' + nomeRemedio.nomeRemedio
    );
  }

  let hora, minutos;

  if (typeof prop.ultimoAlarme === "string") {
    hora = parseInt(prop.ultimoAlarme.substr(0, 2));
    minutos = parseInt(prop.ultimoAlarme.substr(3, 2));
  } else {
    const date = new Date(prop.ultimoAlarme);
    hora = date.getHours();
    minutos = date.getMinutes();
  }

  let today = new Date();

  if (
    hora < today.getHours() ||
    (hora === today.getHours() && minutos < today.getMinutes())
  ) {
    today.setDate(today.getDate() + 1);
  }

  today.setHours(hora, minutos);
  prop.ultimoAlarme = today;

  storage.data.push(prop);
  let prop2 = JSON.stringify(storage);

  try {
    await AsyncStorage.setItem("@Remediario:Medicamentos", prop2);
  } catch (e) {
    console.log(e);
    return e;
  }

  await entregaDados(prop);
  return prop;
};

var ListarMedicamento = async () => {
  var storage;

  try {
    storage = await AsyncStorage.getItem("@Remediario:Medicamentos");
  } catch (e) {
    console.log(e);
    return e;
  }

  storage = JSON.parse(storage);
  return storage;
};

var getMedicamento = async (nomeRemedio) => {
  var storage;

  try {
    storage = await medicamentosDia();
  } catch (e) {
    throw new Error("Falha ao pegar medicamentos do dia");
  }

  const result = storage.data.find((nome) => nomeRemedio === nome.nomeRemedio);
  return result;
};

var usoMedicamento = async (nomeRemedio) => {
  let remedio = await RemoverMedicamento(nomeRemedio);
  remedio = remedio[0];
  console.log("Remedio" + JSON.stringify(remedio));
  let storage = await ListarMedicamento();
  console.log(JSON.stringify(storage));
  let diaAtual = new Date();

  if (!remedio.uso) {
    remedio.uso = [];
  }
  console.log(remedio[0]);
  remedio.uso.push(diaAtual);
  remedio.estoque -= remedio.dosagem;

  const proxAlarme = new Date(remedio.ultimoAlarme);

  switch (remedio.unidadeFrequencia) {
    case "meses":
      proxAlarme.setMonth(proxAlarme.getMonth() + remedio.frequencia);
      break;
    case "dias":
      proxAlarme.setDate(proxAlarme.getDate() + remedio.frequencia);
      break;
    case "horas":
      proxAlarme.setHours(proxAlarme.getHours() + remedio.frequencia);
      break;
    case "minutos":
      proxAlarme.setMinutes(proxAlarme.getMinutes() + remedio.frequencia);
      break;
    default:
      throw new Error(
        "Tipo de frequência mal definido em: " + remedio.nomeRemedio
      );
  }

  remedio.ultimoAlarme = proxAlarme;

  storage.data.push(remedio);
  storage = JSON.stringify(storage);

  try {
    await AsyncStorage.setItem("@Remediario:Medicamentos", storage);
  } catch (e) {
    console.log(e);
    return e;
  }

  return remedio;
};

var DeletarMedicamento = async () => {
  try {
    await AsyncStorage.removeItem("@Remediario:Medicamentos");
  } catch (e) {
    console.log(e);
    return false;
  }

  return true;
};

var RemoverMedicamento = async (nomeRemedio) => {
  let storage;

  try {
    storage = await AsyncStorage.getItem("@Remediario:Medicamentos");
  } catch (e) {
    console.log(e);
  }

  if (storage == null) {
    throw new Error("Lista de medicamentos vazia");
  } else {
    storage = JSON.parse(storage);
  }

  let index = storage.data.findIndex(
    (remedio) => remedio.nomeRemedio === nomeRemedio
  );

  if (index !== -1) {
    let value = storage.data.splice(index, 1);

    try {
      await AsyncStorage.setItem(
        "@Remediario:Medicamentos",
        JSON.stringify(storage)
      );

      return value;
    } catch (e) {
      console.log(e);
      return e;
    }
  } else {
    throw new Error("Valor não encontrado");
  }
};

var medicamentosDia = async () => {
  let storage;
  let result = {
    data: [],
  };

  try {
    storage = await AsyncStorage.getItem("@Remediario:Medicamentos");
  } catch (e) {
    return e;
  }

  if (storage == null) {
    return { data: [] };
  }

  storage = JSON.parse(storage);

  storage.data.map((remedio) => {
    let today = new Date(remedio.ultimoAlarme);
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    while (today.getDate() < tomorrow.getDate()) {
      let index = result.data.findIndex(
        (nome) => nome.nomeRemedio === remedio.nomeRemedio
      );

      if (index === -1) {
        result.data.push({ ...remedio, qtd: 1 });
      } else {
        result.data[index].qtd++;
      }

      switch (remedio.unidadeFrequencia) {
        case "meses":
          today.setMonth(today.getMonth() + remedio.frequencia);
          break;
        case "dias":
          today.setDate(today.getDate() + remedio.frequencia);
          break;
        case "horas":
          today.setHours(today.getHours() + remedio.frequencia);
          break;
        case "minutos":
          today.setMinutes(today.getMinutes() + remedio.frequencia);
          break;
        default:
          throw new Error(
            "Tipo de frequência mal definido em: " + remedio.nomeRemedio
          );
      }
    }
  });

  return result;
};

export {
  SalvarMedicamento,
  ListarMedicamento,
  DeletarMedicamento,
  RemoverMedicamento,
  medicamentosDia,
  getMedicamento,
  usoMedicamento,
};