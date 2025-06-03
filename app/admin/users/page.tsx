import Link from "next/link"

const UsersPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      <div className="flex justify-end mb-4">
        <Link href="/admin/users/create">
          <button className="bg-[#05E0E9] text-black py-2 px-6 rounded-full">New User</button>
        </Link>
      </div>

      {/* Placeholder for user list */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example user data (replace with actual data) */}
            <tr>
              <td className="py-2 px-4 border-b">1</td>
              <td className="py-2 px-4 border-b">John Doe</td>
              <td className="py-2 px-4 border-b">john.doe@example.com</td>
              <td className="py-2 px-4 border-b">
                <Link href="/admin/users/1/edit">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded mr-2">
                    Edit
                  </button>
                </Link>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded">Delete</button>
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">2</td>
              <td className="py-2 px-4 border-b">Jane Smith</td>
              <td className="py-2 px-4 border-b">jane.smith@example.com</td>
              <td className="py-2 px-4 border-b">
                <Link href="/admin/users/2/edit">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded mr-2">
                    Edit
                  </button>
                </Link>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersPage
