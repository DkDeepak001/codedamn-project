import { Projects } from "@repo/database"
import { useEffect, useState } from "react"

export const useProject = ({ projectId }: { projectId: string }) => {
  const [project, setProject] = useState<Projects>()
  useEffect(() => {
    if (!projectId) return

    const fetchUrl = async () => {
      const res = await fetch(`api/projects?projectId=${projectId}`, { method: "GET" })
      const data = await res.json() as { projects: Projects }
      setProject(data.projects)
    }
    fetchUrl()
  }, [projectId])

  return project
}
