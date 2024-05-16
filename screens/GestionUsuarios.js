import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Switch, Button, StyleSheet, Alert } from 'react-native';
import { firestore } from '../firebase'; // Asegúrate de que la ruta del archivo sea correcta
import { collection, doc, updateDoc, getDocs } from 'firebase/firestore'; // Importa getDocs
import { Picker } from '@react-native-picker/picker';

const GestionUsuarios = () => {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const clientesSnapshot = await getDocs(collection(firestore, 'clientes'));
        const clientesData = clientesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setClientes(clientesData);
      } catch (error) {
        console.error('Error al cargar los clientes:', error);
      }
    };

    cargarClientes();
  }, []);

  const actualizarEstadoActivo = async (clienteId, newValue) => {
    try {
      const docRef = doc(firestore, 'clientes', clienteId);
      await updateDoc(docRef, { activo: newValue });
      Alert.alert('Éxito', 'Estado activo actualizado correctamente.');
      
      // Actualizar el estado después de la actualización exitosa
      const nuevosClientes = clientes.map(cliente => {
        if (cliente.id === clienteId) {
          return { ...cliente, activo: newValue };
        }
        return cliente;
      });
      setClientes(nuevosClientes);
    } catch (error) {
      console.error('Error al actualizar el estado activo:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado activo. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  const actualizarRolCliente = async (clienteId, newRole) => {
    try {
      const docRef = doc(firestore, 'clientes', clienteId);
      await updateDoc(docRef, { rol: newRole });
      Alert.alert('Éxito', 'Rol actualizado correctamente.');
      
      // Actualizar el estado después de la actualización exitosa
      const nuevosClientes = clientes.map(cliente => {
        if (cliente.id === clienteId) {
          return { ...cliente, rol: newRole };
        }
        return cliente;
      });
      setClientes(nuevosClientes);
    } catch (error) {
      console.error('Error al actualizar el rol:', error);
      Alert.alert('Error', 'No se pudo actualizar el rol. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.clienteItem}>
      <Text>{item.nombre} {item.apellido}</Text>
      <Picker
        selectedValue={item.rol}
        style={{ height: 50, width: 150 }}
        onValueChange={(newRole) => actualizarRolCliente(item.id, newRole)}
      >
        <Picker.Item label="Superadmin" value="0" />
        <Picker.Item label="AdminClientes" value="1" />
        <Picker.Item label="AdminProductos" value="2" />
        <Picker.Item label="Cliente" value="3" />
      </Picker>
      <Switch
        value={item.activo}
        onValueChange={(newValue) => actualizarEstadoActivo(item.id, newValue)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gestión de Usuarios</Text>
      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default GestionUsuarios;
