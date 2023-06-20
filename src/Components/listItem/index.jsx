import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RemoverMedicamento } from '../../Services/medicamento';
import { ProgressBar } from 'react-native-paper';

export default function ListItem({ remedio, atualizarLista }) {
  let today = new Date(remedio.ultimoAlarme);
  let minutos = today.getMinutes();
  let horas = today.getHours();
  let nome = remedio.nomeRemedio;
  let estoque = remedio.estoque;
  let frequencia = remedio.frequencia;
  let conta = estoque / frequencia;
  /*   console.log(conta, estoque, frequencia); */

  if (minutos < 10) {
    minutos = "0" + minutos;
  }

  async function remover() {
    try {
      await RemoverMedicamento(nome);
      atualizarLista(); // Chama a função para atualizar a lista de medicamentos
    } catch (e) {
      console.log(e);
    }
  }

  function editMedicine() {

  }

  return (
    <TouchableOpacity style={styles.container} onPress={editMedicine}>
      <View style={styles.container2}>
        <Text style={styles.text}>{nome}</Text>
        <View style={styles.alignEnd}>
          <View style={styles.contentHours}>
            <Icon name='clock' color={'white'} style={styles.miniIcon} />
            <Text style={styles.text2}>{horas}:{minutos}</Text>
          </View>
          <TouchableOpacity style={styles.botao} onPress={remover}>
            <Icon name='trash-can' color={'white'} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <ProgressBar
        progress={conta}
        color="#FF"
        style={styles.progressBar}
      />
      <Text style={styles.progressBarText}>
        {frequencia}/{estoque}
      </Text>
    </TouchableOpacity>
  )
}
