import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { appFirebase } from '../firebase';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [stock, setStock] = useState('');
  const [db, setDb] = useState(null);
  const [productoId, setProductoId] = useState('');
  const [editando, setEditando] = useState(false);

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

  const cargarProductos = async () => {
    try {
      const productosSnapshot = await getDocs(collection(db, 'productos'));
      const productosData = productosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
    }
  };

  useEffect(() => {
    if (db) {
      cargarProductos();
    }
  }, [db]);

  const agregarProducto = async () => {
    try {
      await addDoc(collection(db, 'productos'), {
        nombre,
        descripcion,
        valorUnitario: parseFloat(valorUnitario),
        stock: parseInt(stock),
        fechaCreacion: serverTimestamp(),
      });
      cargarProductos();
      limpiarCampos();
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, 'productos', id));
      cargarProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const editarProducto = async () => {
    try {
      await updateDoc(doc(db, 'productos', productoId), {
        nombre,
        descripcion,
        valorUnitario: parseFloat(valorUnitario),
        stock: parseInt(stock),
      });
      cargarProductos();
      limpiarCampos();
      setEditando(false);
    } catch (error) {
      console.error('Error al editar producto:', error);
    }
  };

  const seleccionarProducto = (id, nombre, descripcion, valorUnitario, stock) => {
    setProductoId(id);
    setNombre(nombre);
    setDescripcion(descripcion);
    setValorUnitario(valorUnitario.toString());
    setStock(stock.toString());
    setEditando(true);
  };

  const limpiarCampos = () => {
    setNombre('');
    setDescripcion('');
    setValorUnitario('');
    setStock('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{editando ? 'Editar Producto' : 'Registrar Producto'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor Unitario"
        value={valorUnitario}
        onChangeText={setValorUnitario}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Stock"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />
      <View style={styles.botonesContainer}>
        {editando ? (
          <Button title="Guardar Cambios" onPress={editarProducto} />
        ) : (
          <Button title="Agregar Producto" onPress={agregarProducto} />
        )}
        <Button title="Cancelar" onPress={() => { setEditando(false); limpiarCampos(); }} color="gray" />
      </View>
      <Text style={styles.titulo}>Lista de Productos</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productoItem}>
            <Text>{item.nombre}</Text>
            <Text>Precio: ${parseFloat(item.valorUnitario).toLocaleString('es-CO')}</Text>
            <Button title="Editar" onPress={() => seleccionarProducto(item.id, item.nombre, item.descripcion, item.valorUnitario, item.stock)} />
            <Button title="Eliminar" onPress={() => eliminarProducto(item.id)} color="red"/>
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
  productoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default Productos;