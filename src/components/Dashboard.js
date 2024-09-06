import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../config/firebase';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  color: #333;
`;

const Button = styled.button`
  padding: 8px 16px;
  margin: 5px;
  cursor: pointer;
`;

const Input = styled.input`
  padding: 8px;
  margin: 5px;
  width: 200px;
`;

const ListItem = styled.li`
  cursor: pointer;
  padding: 10px;
  margin: 5px 0;
  background-color: #f0f0f0;
  border-radius: 5px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ListTitle = styled.span`
  flex-grow: 1;
  margin-right: 10px;
  color: #3498db;
  font-weight: bold;
`;

const TodoText = styled.span`
  flex-grow: 1;
  margin-left: 10px;
  text-decoration: ${props => props.completed === 'true' ? 'line-through' : 'none'};
  color: ${props => props.completed === 'true' ? '#7f8c8d' : '#2c3e50'};
`;

const TodoItem = styled.li`
  display: flex;
  align-items: center;
  padding: 5px;
  margin: 5px 0;
  background-color: #f5f5f5;
  border-radius: 3px;
`;

const CompletedSection = styled.div`
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #ccc;
`;

const CompletedTitle = styled.h4`
  color: #888;
  margin-bottom: 5px;
`;

const CompletedTodoItem = styled(TodoItem)`
  opacity: 0.6;
`;

const API_URL = 'https://lyst-app-backend-0803954df2ff.herokuapp.com';

function Dashboard() {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [user, setUser] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodoText, setEditingTodoText] = useState('');
  const [expandedLists, setExpandedLists] = useState({});

  const fetchLists = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_URL}/api/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchLists();
      } else {
        setLists([]);
      }
    });

    return () => unsubscribe();
  }, [fetchLists]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to create a list");
      return;
    }
    try {
      const token = await user.getIdToken();
      await axios.post(`${API_URL}/api/lists`, { title: newListTitle }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewListTitle('');
      fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list. Check console for details.');
    }
  };

  const handleUpdateList = async (listId) => {
    if (editingTitle.trim() === '') return;
    try {
      const token = await user.getIdToken();
      await axios.put(`${API_URL}/api/lists/${listId}`, { title: editingTitle }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingListId(null);
      fetchLists();
    } catch (error) {
      console.error('Error updating list:', error);
      alert('Failed to update list. Check console for details.');
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        const token = await user.getIdToken();
        await axios.delete(`${API_URL}/api/lists/${listId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchLists();
      } catch (error) {
        console.error('Error deleting list:', error);
        alert('Failed to delete list. Check console for details.');
      }
    }
  };

  const handleAddTodo = async (listId) => {
    if (!newTodo.trim()) return;
    try {
      const token = await user.getIdToken();
      await axios.post(`${API_URL}/api/lists/${listId}/todos`, { text: newTodo }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewTodo('');
      fetchLists();
    } catch (error) {
      console.error('Error adding todo:', error.response ? error.response.data : error.message);
      alert('Failed to add todo. Check console for details.');
    }
  };

  const handleToggleTodo = async (listId, todoId) => {
    try {
      const token = await user.getIdToken();
      await axios.patch(`${API_URL}/api/lists/${listId}/todos/${todoId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLists(); // This will re-render the list with the updated todo status
    } catch (error) {
      console.error('Error toggling todo:', error.response ? error.response.data : error.message);
      alert('Failed to toggle todo. Check console for details.');
    }
  };

  const handleUpdateTodo = async (listId, todoId) => {
    if (editingTodoText.trim() === '') return;
    try {
      const token = await user.getIdToken();
      await axios.put(`${API_URL}/api/lists/${listId}/todos/${todoId}`, { text: editingTodoText }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingTodoId(null);
      fetchLists();
    } catch (error) {
      console.error('Error updating todo:', error.response ? error.response.data : error.message);
      alert('Failed to update todo. Check console for details.');
    }
  };

  const handleDeleteTodo = async (listId, todoId) => {
    try {
      const token = await user.getIdToken();
      await axios.delete(`${API_URL}/api/lists/${listId}/todos/${todoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLists();
    } catch (error) {
      console.error('Error deleting todo:', error.response ? error.response.data : error.message);
      alert('Failed to delete todo. Check console for details.');
    }
  };

  const signIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("User signed in:", result.user);
      })
      .catch((error) => {
        console.error("Error signing in:", error);
      });
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log('Signed out successfully');
    }).catch((error) => {
      console.error('Sign out error', error);
    });
  };

  return (
    <Container>
      <Title>Lyst App: Todos Simplified</Title>
      {user ? (
        <>
          <Button onClick={handleSignOut}>Sign Out</Button>
          <form onSubmit={handleCreateList}>
            <Input
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="New list title"
            />
            <Button type="submit">Create List</Button>
          </form>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {lists.map((list) => (
              <ListItem key={list._id}>
                <span 
                  onClick={() => {
                    setExpandedLists(prev => ({...prev, [list._id]: !prev[list._id]}));
                  }}
                  style={{ cursor: 'pointer', marginRight: '10px' }}
                >
                  {expandedLists[list._id] ? '▼' : '▶'}
                </span>
                {editingListId === list._id ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateList(list._id); }}>
                    <Input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleUpdateList(list._id)}
                    />
                  </form>
                ) : (
                  <ListTitle onClick={() => { setEditingListId(list._id); setEditingTitle(list.title); }}>
                    {list.title} ({list.todos ? list.todos.length : 0} items)
                  </ListTitle>
                )}
                <Button onClick={(e) => { e.stopPropagation(); handleDeleteList(list._id); }}>Delete</Button>
                {expandedLists[list._id] && (
                  <div style={{ marginLeft: '20px', marginTop: '10px', width: '100%' }}>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddTodo(list._id); }}>
                      <Input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="New todo"
                      />
                      <Button type="submit">Add Todo</Button>
                    </form>
                    {list.todos && list.todos.length > 0 ? (
                      <>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                          {list.todos.filter(todo => !todo.completed).map((todo) => (
                            <TodoItem key={todo._id}>
                              <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleToggleTodo(list._id, todo._id)}
                              />
                              {editingTodoId === todo._id ? (
                                <form onSubmit={(e) => { e.preventDefault(); handleUpdateTodo(list._id, todo._id); }}>
                                  <Input
                                    type="text"
                                    value={editingTodoText}
                                    onChange={(e) => setEditingTodoText(e.target.value)}
                                    onBlur={() => handleUpdateTodo(list._id, todo._id)}
                                  />
                                </form>
                              ) : (
                                <TodoText 
                                  completed={todo.completed.toString()}
                                  onClick={() => { setEditingTodoId(todo._id); setEditingTodoText(todo.text); }}
                                >
                                  {todo.text}
                                </TodoText>
                              )}
                              <Button onClick={() => handleDeleteTodo(list._id, todo._id)}>Delete</Button>
                            </TodoItem>
                          ))}
                        </ul>
                        {list.todos.some(todo => todo.completed) && (
                          <CompletedSection>
                            <CompletedTitle>Completed</CompletedTitle>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                              {list.todos.filter(todo => todo.completed).map((todo) => (
                                <CompletedTodoItem key={todo._id}>
                                  <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => handleToggleTodo(list._id, todo._id)}
                                  />
                                  <TodoText completed="true">
                                    {todo.text}
                                  </TodoText>
                                  <Button onClick={() => handleDeleteTodo(list._id, todo._id)}>Delete</Button>
                                </CompletedTodoItem>
                              ))}
                            </ul>
                          </CompletedSection>
                        )}
                      </>
                    ) : (
                      <p>No todos in this list yet.</p>
                    )}
                  </div>
                )}
              </ListItem>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p>Please sign in to view and create lists.</p>
          <Button onClick={signIn}>Sign In with Google</Button>
        </>
      )}
    </Container>
  );
}

export default Dashboard;