import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57"];

function App() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function fetchData() {
      // Fetching 50 questions
      const resQ = await axios.get("https://opentdb.com/api.php?amount=50");
      setQuestions(resQ.data.results);

      await new Promise(res => setTimeout(res, 1000)); // Waiting for 1 second to avoid hitting rate limits

      // Fetching categories
      const resC = await axios.get("https://opentdb.com/api_category.php");
      setCategories(resC.data.trivia_categories);
    }
    fetchData();
  }, []);

  // Showing all categories as a list
  const allCategoryNames = categories.map(cat => cat.name);

  // Calculating the category distribution from all questions
  const categoryCount = {};
  questions.forEach(q => {
    const cat = q.category;
    if (!categoryCount[cat]) categoryCount[cat] = 0;
    categoryCount[cat]++;
  });
  const byCategory = Object.entries(categoryCount).map(([key, value]) => ({
    name: key,
    value
  }));

  // Filtering questions for the pie chart
  const filteredQuestions = selectedCategory === "all"
    ? questions
    : questions.filter(q => q.category === selectedCategory);

  // Calculating difficulty distribution for filtered questions
  const difficultyCount = { easy: 0, medium: 0, hard: 0 };
  filteredQuestions.forEach(q => difficultyCount[q.difficulty]++);
  const byDifficulty = Object.entries(difficultyCount).map(([key, value]) => ({
    name: key,
    value
  }));

  // UI
  return (
    <div style={{padding: 24, fontFamily: "sans-serif"}}>
      <h1>Open Trivia DB Visualizer</h1>
      <h3>Categories Available:</h3>
      <ul>
        {allCategoryNames.map((name, idx) => (
          <li key={idx}>{name}</li>
        ))}
      </ul>
      <div style={{marginBottom: 16}}>
        <label>Select Category: </label>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
      <h3>Questions by Category</h3>
      <BarChart width={600} height={300} data={byCategory}>
        <XAxis dataKey="name" angle={30} textAnchor="start" interval={0} height={150} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
      <h3>
        Questions by Difficulty
        {selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}
      </h3>
      <PieChart width={400} height={300}>
        <Pie
          data={byDifficulty}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {byDifficulty.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}

export default App;
