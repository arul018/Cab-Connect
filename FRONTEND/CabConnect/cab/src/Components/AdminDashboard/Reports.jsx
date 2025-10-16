import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users2, Car, Download, Star } from 'lucide-react';
import Swal from 'sweetalert2';

const SimpleBarChart = ({ title, data, total, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-xl font-semibold text-gray-800 ml-3">{title}</h3>
    </div>
    <p className="text-gray-600 mb-6">Total Count: <span className="font-bold text-gray-800">{total}</span></p>
    <div className="space-y-4">
      {data.map(item => (
        <div key={item.name}>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-medium text-gray-700">{item.name}</span>
            <span className="font-semibold text-gray-800">{item.value}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
              style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Reports = () => {
  const [users, setUsers] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [approvedDrivers, setApprovedDrivers] = useState([]);
  const [rejectedDrivers, setRejectedDrivers] = useState([]);
  const [driverRatings, setDriverRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Users data
        const usersRes = await fetch('http://localhost:8305/api/users');
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const usersData = await usersRes.json();
        setUsers(usersData.map(u => ({
          ...u,
          id: u.userId,
          name: u.fullName
        })));

        // Fetch Pending Drivers
        const pendingRes = await fetch('http://localhost:8305/admin/pending-drivers');
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          setPendingDrivers(Array.isArray(pendingData) ? pendingData : []);
        }

        // Fetch Approved Drivers
        const approvedRes = await fetch('http://localhost:8305/admin/approved-drivers');
        if (approvedRes.ok) {
          const approvedData = await approvedRes.json();
          setApprovedDrivers(Array.isArray(approvedData) ? approvedData : []);
        }

        // Fetch Rejected Drivers
        const rejectedRes = await fetch('http://localhost:8305/admin/rejected-drivers');
        if (rejectedRes.ok) {
          const rejectedData = await rejectedRes.json();
          setRejectedDrivers(Array.isArray(rejectedData) ? rejectedData : []);
        }

        // Fetch Driver Ratings from Feedback Service
        const feedbackRes = await fetch('http://localhost:8305/api/feedback');
        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          if (Array.isArray(feedbackData)) {
            const ratingsMap = {};
            feedbackData.forEach(feedback => {
              const driverName = feedback.driverName;
              if (!ratingsMap[driverName]) {
                ratingsMap[driverName] = {
                  driverName,
                  ratings: [],
                  averageRating: 0,
                  feedbackCount: 0
                };
              }
              ratingsMap[driverName].ratings.push(feedback.ratings);
              ratingsMap[driverName].feedbackCount++;
            });
            
            const ratingsArray = Object.values(ratingsMap).map(driver => {
              const total = driver.ratings.reduce((sum, rating) => sum + rating, 0);
              driver.averageRating = (total / driver.ratings.length).toFixed(1);
              return driver;
            });
            setDriverRatings(ratingsArray);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      Swal.fire('No Data', `There is no data to download for ${filename}.`, 'info');
      return;
    }

    const headers = Object.keys(data[0]);
    const replacer = (key, value) => (value === null || value === undefined ? '' : value);

    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(fieldName => JSON.stringify(row[fieldName], replacer))
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadUsers = () => {
    const dataForCsv = users.map(u => ({
      ID: u.id,
      'Full Name': u.fullName,
      Email: u.email,
      Phone: u.phone,
      Role: u.role,
      'Block Status': u.blockStatus === 'yes' ? 'Blocked' : 'Active',
      Comments: u.comments || '',
      'Registration Date': u.registrationDate || '',
    }));
    downloadCSV(dataForCsv, 'users-report.csv');
  };

  const handleDownloadDrivers = () => {
    const allDrivers = [...pendingDrivers, ...approvedDrivers, ...rejectedDrivers];
    const dataForCsv = allDrivers.map(d => ({
      ID: d.userId || d.id,
      'Full Name': d.fullName,
      Email: d.email,
      Phone: d.phone,
      'Vehicle Brand': d.vehicleBrand || '',
      'Vehicle Model': d.vehicleModel || '',
      'Vehicle Number': d.vehicleNumber || '',
      'License Number': d.licenseNumber || '',
      'Aadhar Number': d.aadharNumber || '',
      'Admin Approval': d.adminApproval || '',
      'Admin Comment': d.adminComment || '',
      'Registration Date': d.registrationDate || '',
    }));
    downloadCSV(dataForCsv, 'drivers-report.csv');
  };

  const handleDownloadRatings = () => {
    const dataForCsv = driverRatings.map(d => ({
      'Driver Name': d.driverName,
      'Average Rating': d.averageRating,
      'Total Feedback': d.feedbackCount,
      'Rating Category': d.averageRating >= 4.5 ? 'Excellent' : 
                       d.averageRating >= 3.5 ? 'Good' : 
                       d.averageRating >= 2.5 ? 'Average' : 'Poor'
    }));
    downloadCSV(dataForCsv, 'driver-ratings-report.csv');
  };

  // Calculate user stats from real data
  const activeUsers = users.filter(u => u.blockStatus === 'no').length;
  const blockedUsers = users.filter(u => u.blockStatus === 'yes').length;
  const userData = [
    { name: 'Active Users', value: activeUsers, color: 'bg-green-500' },
    { name: 'Blocked Users', value: blockedUsers, color: 'bg-red-500' },
  ];

  // Calculate driver stats from real data
  const totalDrivers = pendingDrivers.length + approvedDrivers.length + rejectedDrivers.length;
  const driverData = [
    { name: 'Pending Approval', value: pendingDrivers.length, color: 'bg-blue-500' },
    { name: 'Approved', value: approvedDrivers.length, color: 'bg-green-500' },
    { name: 'Rejected', value: rejectedDrivers.length, color: 'bg-red-500' },
  ];

  // Calculate rating stats from real feedback data
  const excellentRatings = driverRatings.filter(d => d.averageRating >= 4.5).length;
  const goodRatings = driverRatings.filter(d => d.averageRating >= 3.5 && d.averageRating < 4.5).length;
  const averageRatings = driverRatings.filter(d => d.averageRating >= 2.5 && d.averageRating < 3.5).length;
  const poorRatings = driverRatings.filter(d => d.averageRating < 2.5).length;
  const ratingData = [
    { name: 'Excellent (4.5+)', value: excellentRatings, color: 'bg-green-500' },
    { name: 'Good (3.5-4.4)', value: goodRatings, color: 'bg-blue-500' },
    { name: 'Average (2.5-3.4)', value: averageRatings, color: 'bg-yellow-500' },
    { name: 'Poor (<2.5)', value: poorRatings, color: 'bg-red-500' },
  ];

  if (loading) return <div className="p-6 text-center text-gray-500">Loading reports...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Reports Overview</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadUsers}
            className="flex items-center bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200"
          >
            <Download size={18} className="mr-2" />
            Users Report
          </button>
          <button
            onClick={handleDownloadDrivers}
            className="flex items-center bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-all duration-200"
          >
            <Download size={18} className="mr-2" />
            Drivers Report
          </button>
          <button
            onClick={handleDownloadRatings}
            className="flex items-center bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-purple-600 transition-all duration-200"
          >
            <Download size={18} className="mr-2" />
            Ratings Report
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <SimpleBarChart 
          title="User Management" 
          data={userData} 
          total={users.length} 
          icon={<Users2 className="text-blue-500" size={28} />} 
        />
        <SimpleBarChart 
          title="Driver Applications" 
          data={driverData} 
          total={totalDrivers}
          icon={<Car className="text-green-500" size={28} />} 
        />
        <SimpleBarChart 
          title="Driver Ratings Distribution" 
          data={ratingData} 
          total={driverRatings.length}
          icon={<Star className="text-yellow-500" size={28} />} 
        />
      </div>
    </div>
  );
};

export default Reports;