import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { appFirebase } from '../firebase';
import { Picker } from '@react-native-picker/picker';

const FacturasScreen = () => {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [db, setDb] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

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

  useEffect(() => {
    if (db) {
      cargarClientes();
      cargarFacturas();
    }
  }, [db, clienteSeleccionado]);

  const cargarClientes = async () => {
    try {
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const clientesData = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar los clientes:', error);
    }
  };

  const cargarFacturas = async () => {
    try {
      let queryFacturas = collection(db, 'facturas');

      if (clienteSeleccionado) {
        queryFacturas = query(queryFacturas, where('cliente', '==', clienteSeleccionado));
      }

      const facturasSnapshot = await getDocs(queryFacturas);
      const facturasData = facturasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFacturas(facturasData);
    } catch (error) {
      console.error('Error al cargar las facturas:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Facturas</Text>
      
      <Picker
        selectedValue={clienteSeleccionado}
        onValueChange={(itemValue) => setClienteSeleccionado(itemValue)}
      >
        <Picker.Item label="Todos los clientes" value={null} />
        {clientes.map((cliente) => (
          <Picker.Item key={cliente.id} label={cliente.nombre} value={cliente.nombre} />
        ))}
      </Picker>
      
      <FlatList
        data={facturas}
        renderItem={({ item }) => (
          <View style={styles.itemFactura}>
            <Text>ID Factura: {item.id}</Text>
            <Text>Fecha: {item.fecha}</Text>
            <Text>Cliente: {item.cliente}</Text>
            <Text>Productos:</Text>
            <FlatList
              data={item.productos}
              renderItem={({ item }) => (
                <View style={styles.itemProducto}>
                  <Text>ID Producto: {item.idProducto}</Text>
                  <Text>Cantidad: {item.cantidad}</Text>
                  <Text>Subtotal: {item.subtotal}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            <Text>Total: {item.total}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
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
  itemFactura: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 10,
  },
  itemProducto: {
    marginLeft: 20,
    marginTop: 5,
    marginBottom: 5,
  },
});

export default FacturasScreen;