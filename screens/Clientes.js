import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { appFirebase } from '../firebase';

const RegistrarClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // Estado para el cliente seleccionado
  const [db, setDb] = useState(null);
  const [editando, setEditando] = useState(false); // Estado para saber si se está editando un cliente

  useEffect(() => {
    const initializeFirestore = async () => {
      try {
        const firestore = getFirestore(appFirebase);
        setDb(firestore);
      } catch (error) {
        console.error('Error initializing Firestore:', error);
      }
    };

    initializeFirestore();
  }, []);

  const cargarClientes = async () => {
    try {
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const clientesData = clientesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar los clientes:', error);
    }
  };

  useEffect(() => {
    if (db) {
      cargarClientes();
    }
  }, [db]);

  const agregarCliente = async () => {
    try {
      if (editando) {
        await updateDoc(doc(db, 'clientes', clienteSeleccionado.id), {
          nombre,
          apellido,
          correo,
        });
        setEditando(false);
      } else {
        await addDoc(collection(db, 'clientes'), {
          nombre,
          apellido,
          correo,
          fechaCreacion: serverTimestamp(),
        });
      }
      cargarClientes();
      limpiarCampos();
      setClienteSeleccionado(null);
    } catch (error) {
      console.error('Error al guardar cambios del cliente:', error);
    }
  };

  const eliminarCliente = async (id) => {
    try {
      await deleteDoc(doc(db, 'clientes', id));
      cargarClientes();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    }
  };

  const editarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setNombre(cliente.nombre);
    setApellido(cliente.apellido);
    setCorreo(cliente.correo);
    setEditando(true);
  };

  const limpiarCampos = () => {
    setNombre('');
    setApellido('');
    setCorreo('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registrar Cliente</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={apellido}
        onChangeText={setApellido}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
      />
      <View style={styles.botonesContainer}>
        <Button title={editando ? "Guardar Cambios" : "Agregar Cliente"} onPress={agregarCliente} />
        {editando && (
          <Button title="Cancelar" onPress={() => { setEditando(false); limpiarCampos(); }} color="gray" />
        )}
      </View>
      <Text style={styles.titulo}>Lista de Clientes</Text>
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.clienteItem}>
            <Text>{item.nombre} {item.apellido}</Text>
            <Button title="Eliminar" onPress={() => eliminarCliente(item.id)} color="red" />
            <Button title="Editar" onPress={() => editarCliente(item)} />
          </View>
        )}
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  clienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default RegistrarClientes;