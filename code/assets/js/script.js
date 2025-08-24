// Chart.js - Events Overview
const ctx1 = document.getElementById('eventsChart').getContext('2d');
new Chart(ctx1, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Events',
      data: [3, 4, 2, 6, 5],
      borderColor: '#4e73df',
      backgroundColor: 'rgba(78, 115, 223, 0.2)',
      fill: true,
      tension: 0.3
    }]
  }
});

// Chart.js - Vendor Distribution
const ctx2 = document.getElementById('vendorChart').getContext('2d');
new Chart(ctx2, {
  type: 'doughnut',
  data: {
    labels: ['Catering', 'Decoration', 'Sound System', 'Others'],
    datasets: [{
      data: [5, 3, 2, 4],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']
    }]
  }
});

// Logout Button
document.getElementById('logoutBtn').addEventListener('click', () => {
  alert('You have been logged out!');
});
