import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Database, 
  FileText, 
  Package, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [recoveryTrends, setRecoveryTrends] = useState([])
  const [lithologyData, setLithologyData] = useState([])
  const [qaqcStats, setQaqcStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch project summary
        const summaryRes = await fetch('http://localhost:5001/api/analytics/project-summary')
        const summaryData = await summaryRes.json()
        setSummary(summaryData)

        // Fetch recovery trends
        const trendsRes = await fetch('http://localhost:5001/api/analytics/recovery-trends')
        const trendsData = await trendsRes.json()
        setRecoveryTrends(trendsData.slice(0, 10)) // Show top 10

        // Fetch lithology distribution
        const lithologyRes = await fetch('http://localhost:5001/api/analytics/lithology-distribution')
        const lithologyData = await lithologyRes.json()
        setLithologyData(lithologyData.slice(0, 5)) // Show top 5

        // Fetch QA/QC statistics
        const qaqcRes = await fetch('http://localhost:5001/api/qaqc-records/statistics')
        const qaqcData = await qaqcRes.json()
        setQaqcStats(qaqcData)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of core logging operations and key metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drill Holes</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_drill_holes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across {summary?.projects?.length || 0} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Runs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_core_runs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.total_intervals || 0} logged intervals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Recovery</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.avg_recovery || 0}%</div>
            <Progress value={summary?.avg_recovery || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average RQD</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.avg_rqd || 0}%</div>
            <Progress value={summary?.avg_rqd || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Core Recovery by Drill Hole</CardTitle>
            <CardDescription>Average recovery percentage for each drill hole</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recoveryTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hole_id" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg_recovery" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lithology Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lithology Distribution</CardTitle>
            <CardDescription>Distribution of rock types by total length</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={lithologyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ lithology, percentage }) => `${lithology}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {lithologyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* QA/QC Status */}
        <Card>
          <CardHeader>
            <CardTitle>QA/QC Status</CardTitle>
            <CardDescription>Quality control metrics and pass rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Pass Rate</span>
                </div>
                <Badge variant="secondary">{qaqcStats?.pass_rate || 0}%</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Warning Rate</span>
                </div>
                <Badge variant="secondary">{qaqcStats?.warning_rate || 0}%</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Fail Rate</span>
                </div>
                <Badge variant="secondary">{qaqcStats?.fail_rate || 0}%</Badge>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-600">
                  Total Records: {qaqcStats?.total_records || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>Summary of active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary?.projects?.slice(0, 5).map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{project.project_name}</div>
                    <div className="text-xs text-gray-500">
                      {project.drill_holes} holes • {project.total_depth}m total depth
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{project.avg_recovery}%</div>
                    <div className="text-xs text-gray-500">Recovery</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

