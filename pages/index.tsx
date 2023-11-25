import { GetServerSideProps } from 'next'
import router, { useRouter } from 'next/router'
import { useState } from 'react'
import { prisma } from '../lib/prisma'


interface Notes{
  notes: {
    id: string
    title: string
    description: string
    completed: boolean
    
  }[]
}

interface FormData {
  title: string
  description: string
  id: string
}

const Home = ({ notes }: Notes) => {
  const [form, setForm] = useState<FormData>({ title: '', description: '', id: '' });

  const refreshData = () => {
    router.replace(router.asPath);
  };

  async function create(data: FormData) {
    try {
      fetch('http://localhost:3000/api/create', {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }).then(() => {
        if (data.id) {
          deleteNote(data.id);
          setForm({ title: '', description: '', id: '' });
          refreshData();
        } else {
          setForm({ title: '', description: '', id: '' });
          refreshData();
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteNote(id: string) {
    try {
      fetch(`http://localhost:3000/api/note/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      }).then(() => {
        refreshData();
      });
    } catch (error) {
      console.log(error);
    }
  }

  const handleCheckboxChange = async (id: string, completed: boolean) => {
    try {
      await fetch(`http://localhost:3000/api/note/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });
      refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      create(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1 className="text-center font-bold text-5xl my-11 primary">Simple Task Management</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(form);
        }}
        className="w-auto min-w-[25%] max-w-min mx-auto space-y-6 flex flex-col items-stretch"
      >
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border-2 rounded border-gray-600 p-1"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border-2 rounded border-gray-600 p-1"
        />
        <button type="submit" className="bg-lime-500 text-neutral-50 rounded-full p-2 font-bold">
          Add Task
        </button>
      </form>
      <div className="w-auto min-w-[25%] max-w-min mt-20 mx-auto space-y-6 flex flex-col items-stretch">
        <ul>
          {notes.map((note) => (
            <li key={note.id} className="border-b border-gray-600 p-2">
              <div className="flex justify-between items-center">
                <input
                  type="checkbox"
                  checked={note.completed}
                  onChange={() => handleCheckboxChange(note.id, !note.completed)}
                  className="rounded-full h-5 w-5"
                />
                <div className="flex-1 ms-3 text-2xl primary">
                  <h3 className={`font-bold ${note.completed ? 'line-through' : ''}`}>
                    {note.title}
                  </h3>
                  <p className={`text-sm ${note.completed ? 'line-through' : ''}`}>
                    {note.description}
                  </p>
                </div>
                <button
                  onClick={() => setForm({ title: note.title, description: note.description, id: note.id })}
                  className="bg-transparent border border-lime-500 text-lime-500 px-3 rounded font-bold text-1xl hover:text-black transition-all duration-300"
                >
                  Update
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="ms-2 bg-transparent border border-lime-500 text-lime-500 px-3 rounded font-bold text-1xl hover:text-black transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home


export const getServerSideProps: GetServerSideProps = async () => {
  const notes = await prisma.note.findMany({
    select: {
      title: true,
      id: true,
      description: true
    }
  })

  return {
    props: {
      notes
    }
  }
}