import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, setDoc, doc, deleteDoc, onSnapshot } from '../firebase';

function ManualEntries() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    datum: '',
    projektnummer: '',
    projektname: '',
    anlagentyp: '',
    angefragtBei: '',
    angefragtVon: '',
    abgabeBis: '',
    status: '',
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const entriesCollection = collection(db, 'manualEntries');
    const unsubscribe = onSnapshot(entriesCollection, (snapshot) => {
      const entriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(entriesData);
      setDbError(null);
    }, (error) => {
      console.error("Error fetching manual entries:", error);
      setDbError("Fehler beim Laden der Anfragen aus der Datenbank.");
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const handleAddEntry = async () => {
    try {
      const entriesCollection = collection(db, 'manualEntries');
      await addDoc(entriesCollection, newEntry);
      setNewEntry({
        datum: '',
        projektnummer: '',
        projektname: '',
        anlagentyp: '',
        angefragtBei: '',
        angefragtVon: '',
        abgabeBis: '',
        status: '',
      });
      setDbError(null);
    } catch (error) {
      console.error("Error adding manual entry", error);
      setDbError("Fehler beim Hinzufügen der Anfrage zur Datenbank.");
    }
  };

  const handleEditEntry = (index) => {
    setEditingIndex(index);
    setNewEntry(entries[index]);
  };

  const handleUpdateEntry = async () => {
    try {
      const entryDocRef = doc(db, 'manualEntries', entries[editingIndex].id);
      await setDoc(entryDocRef, newEntry);
      const updatedEntries = [...entries];
      updatedEntries[editingIndex] = newEntry;
      setEntries(updatedEntries);
      setEditingIndex(null);
      setNewEntry({
        datum: '',
        projektnummer: '',
        projektname: '',
        anlagentyp: '',
        angefragtBei: '',
        angefragtVon: '',
        abgabeBis: '',
        status: '',
      });
      setDbError(null);
    } catch (error) {
      console.error("Error updating manual entry", error);
      setDbError("Fehler beim Aktualisieren der Anfrage in der Datenbank.");
    }
  };

  const handleDeleteEntry = async (index) => {
    try {
      const entryDocRef = doc(db, 'manualEntries', entries[index].id);
      await deleteDoc(entryDocRef);
      const updatedEntries = [...entries];
      updatedEntries.splice(index, 1);
      setEntries(updatedEntries);
      setDbError(null);
    } catch (error) {
      console.error("Error deleting manual entry", error);
      setDbError("Fehler beim Löschen der Anfrage aus der Datenbank.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getRowStyle = (status) => {
    let backgroundColor = '';
    let color = '#fff'; // Default text color
    switch (status) {
      case 'angefragt':
        return { backgroundColor: '#ffc107', color: '#000' }; // Yellow
      case 'angebot erhalten':
        return { backgroundColor: '#28a745', color: '#fff' }; // Green
      case 'Absage':
        return { backgroundColor: '#dc3545', color: '#fff' }; // Red
      case 'Erinnerung':
          return { backgroundColor: '#007bff', color: '#fff' }; // Blue
      default:
        return {};
    }
    return { backgroundColor, color };
  };

  const anlagentypOptions = ["USV", "BSV", "GR", "Bat", "PS", "PP", "PS2", "CSS", "Sibelon", "Merlin", "Sonstiges", "24V", "48V", "60V", "Priorit", "OP"].sort();
  const angefragtBeiOptions = ["Freimann", "Bonecke", "Steuernagel", "Theis", "Sonstige", "Jörger", "Schnell", "ODS", "Landmann", "Beck", "Mayer", "Socomec", "Wabnitz", "Rutz", "JeWo", "Limbach", "Appel", "Schuster", "GFS", "Vertiv"].sort();
  const angefragtVonOptions = ["Fetzer", "Baus", "Ehnert"].sort();
  const statusOptions = ["angefragt", "Absage", "angebot erhalten", "Erinnerung"].sort();

  return (
    <div>
      <h2>Anfragen</h2>
      {dbError && <div className="error-message">{dbError}</div>}
      <table className="manual-entries-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Projektnummer</th>
            <th>Projektname</th>
            <th>Anlagentyp</th>
            <th>Angefragt bei</th>
            <th>Angefragt von</th>
            <th>Abgabe bis</th>
            <th>Status</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.id} style={getRowStyle(entry.status)}>
              <td>{formatDate(entry.datum)}</td>
              <td>{entry.projektnummer}</td>
              <td>{entry.projektname}</td>
              <td>{entry.anlagentyp}</td>
              <td>{entry.angefragtBei}</td>
              <td>{entry.angefragtVon}</td>
              <td>{formatDate(entry.abgabeBis)}</td>
              <td>{entry.status}</td>
              <td>
                <button onClick={() => handleEditEntry(index)}>Bearbeiten</button>
                <button onClick={() => handleDeleteEntry(index)}>Löschen</button>
              </td>
            </tr>
          ))}
          <tr style={getRowStyle(newEntry.status)}>
            <td><input type="date" name="datum" value={newEntry.datum} onChange={handleInputChange} /></td>
            <td><input type="text" name="projektnummer" value={newEntry.projektnummer} onChange={handleInputChange} /></td>
            <td><input type="text" name="projektname" value={newEntry.projektname} onChange={handleInputChange} /></td>
            <td>
              <select name="anlagentyp" value={newEntry.anlagentyp} onChange={handleInputChange}>
                <option value="">Auswählen</option>
                {anlagentypOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </td>
            <td>
              <select name="angefragtBei" value={newEntry.angefragtBei} onChange={handleInputChange}>
                <option value="">Auswählen</option>
                {angefragtBeiOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </td>
            <td>
              <select name="angefragtVon" value={newEntry.angefragtVon} onChange={handleInputChange}>
                <option value="">Auswählen</option>
                {angefragtVonOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </td>
            <td><input type="date" name="abgabeBis" value={newEntry.abgabeBis} onChange={handleInputChange} /></td>
            <td>
              <select name="status" value={newEntry.status} onChange={handleInputChange}>
                <option value="">Auswählen</option>
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </td>
            <td>
              {editingIndex !== null ? (
                <button onClick={handleUpdateEntry}>Update</button>
              ) : (
                <button onClick={handleAddEntry}>Eintrag hinzufügen</button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ManualEntries;
