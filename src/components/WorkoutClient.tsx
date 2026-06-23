'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dumbbell, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle, 
  RefreshCw, 
  Zap, 
  Flame, 
  Info,
  Calendar,
  Award,
  Play
} from 'lucide-react'
import { Profile } from '@/types'
import { completeWorkoutExercise } from '@/app/actions/workout'
import { getStatCategoryForBodyPart } from '@/lib/game'
import CelebrationOverlays from '@/components/CelebrationOverlays'

// Type definitions
type WorkoutType = 'home' | 'gym' | 'calisthenics' | 'band'
type BodyPart = 'chest' | 'back' | 'core' | 'legs' | 'shoulders' | 'arms'

interface Exercise {
  name: string
  description: string
  sets: number
  reps: string
  instructions: string[]
}

interface WorkoutClientProps {
  initialProfile: Profile
  initialCompletedNames: string[]
}

// 3D Point projection interfaces
interface Point3D {
  x: number
  y: number
  z: number
  name: string
  group?: BodyPart
}

interface Connection {
  from: number
  to: number
  color?: string
}

// 3D model vertices for the holographic human figure
const SKELETON_POINTS: Point3D[] = [
  { x: 0, y: 1.6, z: 0, name: 'Head' }, // 0
  { x: 0, y: 1.35, z: 0, name: 'Neck' }, // 1
  { x: 0, y: 1.05, z: 0, name: 'Spine_Chest', group: 'chest' }, // 2 (chest front / back)
  { x: 0, y: 0.7, z: 0, name: 'Spine_Core', group: 'core' }, // 3 (core front)
  { x: 0, y: 0.4, z: 0, name: 'Pelvis' }, // 4
  
  // Left Arm
  { x: -0.38, y: 1.3, z: 0, name: 'L_Shoulder', group: 'shoulders' }, // 5
  { x: -0.58, y: 0.9, z: 0, name: 'L_Elbow', group: 'arms' }, // 6
  { x: -0.72, y: 0.5, z: 0, name: 'L_Wrist', group: 'arms' }, // 7
  
  // Right Arm
  { x: 0.38, y: 1.3, z: 0, name: 'R_Shoulder', group: 'shoulders' }, // 8
  { x: 0.58, y: 0.9, z: 0, name: 'R_Elbow', group: 'arms' }, // 9
  { x: 0.72, y: 0.5, z: 0, name: 'R_Wrist', group: 'arms' }, // 10

  // Left Leg
  { x: -0.18, y: 0.4, z: 0, name: 'L_Hip', group: 'legs' }, // 11
  { x: -0.22, y: -0.15, z: 0, name: 'L_Knee', group: 'legs' }, // 12
  { x: -0.24, y: -0.75, z: 0, name: 'L_Ankle', group: 'legs' }, // 13

  // Right Leg
  { x: 0.18, y: 0.4, z: 0, name: 'R_Hip', group: 'legs' }, // 14
  { x: 0.22, y: -0.15, z: 0, name: 'R_Knee', group: 'legs' }, // 15
  { x: 0.24, y: -0.75, z: 0, name: 'R_Ankle', group: 'legs' }  // 16
]

const SKELETON_CONNECTIONS: Connection[] = [
  { from: 0, to: 1 }, // Head to Neck
  { from: 1, to: 2 }, // Neck to Spine Chest
  { from: 2, to: 3 }, // Chest to Core
  { from: 3, to: 4 }, // Core to Pelvis
  
  // Left Arm
  { from: 1, to: 5 }, // Neck to L Shoulder
  { from: 5, to: 6 }, // Shoulder to Elbow
  { from: 6, to: 7 }, // Elbow to Wrist
  
  // Right Arm
  { from: 1, to: 8 }, // Neck to R Shoulder
  { from: 8, to: 9 }, // Shoulder to Elbow
  { from: 9, to: 10 }, // Elbow to Wrist

  // Left Leg
  { from: 4, to: 11 }, // Pelvis to L Hip
  { from: 11, to: 12 }, // Hip to Knee
  { from: 12, to: 13 }, // Knee to Ankle

  // Right Leg
  { from: 4, to: 14 }, // Pelvis to R Hip
  { from: 14, to: 15 }, // Hip to Knee
  { from: 15, to: 16 }  // Knee to Ankle
]

// The workout dataset mapped by type and body parts
const EXERCISES_DATA: Record<WorkoutType, Record<BodyPart, Exercise[]>> = {
  calisthenics: {
    chest: [
      {
        name: "Standard Push-ups",
        description: "Core chest building block using body weight.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Keep body straight like a plank.", "Lower chest until it is an inch from the floor.", "Push back up dynamically."]
      },
      {
        name: "Parallel Bar Dips",
        description: "Advanced lower chest and tricep developer.",
        sets: 3,
        reps: "8 - 12 reps",
        instructions: ["Grip parallel bars and suspend your body.", "Leaning slightly forward, lower your body by bending elbows.", "Push upward until arms are fully locked."]
      },
      {
        name: "Decline Push-ups",
        description: "Focuses on upper chest activation.",
        sets: 3,
        reps: "10 - 12 reps",
        instructions: ["Place feet on an elevated platform (chair/bed).", "Hands on the floor, standard shoulder width.", "Perform push-ups keeping core tight."]
      }
    ],
    back: [
      {
        name: "Pull-ups",
        description: "The ultimate upper back and lat builder.",
        sets: 3,
        reps: "6 - 10 reps",
        instructions: ["Hang from a bar with palms facing away.", "Pull your chest up towards the bar.", "Lower yourself slowly with control."]
      },
      {
        name: "Chin-ups",
        description: "Focuses on lower lats and bicep engagement.",
        sets: 3,
        reps: "8 - 12 reps",
        instructions: ["Grip the bar with palms facing towards you.", "Pull chest to the bar, squeeze shoulder blades.", "Lower down slowly."]
      },
      {
        name: "Inverted Rows (Australian Pull-ups)",
        description: "Excellent horizontal pulling movement.",
        sets: 3,
        reps: "10 - 15 reps",
        instructions: ["Use a low bar, hang underneath with heels on floor.", "Pull chest to the bar, keeping body straight.", "Slowly lower back down."]
      }
    ],
    core: [
      {
        name: "Hanging Leg Raises",
        description: "Demanding lower abdominal exercise.",
        sets: 3,
        reps: "10 - 12 reps",
        instructions: ["Hang from pull-up bar.", "Raise legs straight up to 90 degrees without swinging.", "Lower them slowly."]
      },
      {
        name: "Plank Hold",
        description: "Isometric core stability builder.",
        sets: 3,
        reps: "45 - 60 seconds",
        instructions: ["Rest forearms on the ground, toes on floor.", "Keep body in a perfectly straight line.", "Engage abs and glutes, hold position."]
      },
      {
        name: "Hollow Body Hold",
        description: "Gymnastics core stabilization hold.",
        sets: 3,
        reps: "30 - 45 seconds",
        instructions: ["Lie on back, arms extended overhead.", "Lift head, shoulders, and legs slightly off the floor.", "Ensure lower back is flat against the ground."]
      }
    ],
    legs: [
      {
        name: "Pistol Squats",
        description: "Elite single-leg squat for balance and strength.",
        sets: 3,
        reps: "5 - 8 per leg",
        instructions: ["Stand on one leg, extend other leg straight out.", "Squat down on standing leg as low as possible.", "Drive back up to standing."]
      },
      {
        name: "Bodyweight Squats",
        description: "Fundamental lower body conditioning.",
        sets: 3,
        reps: "20 - 25 reps",
        instructions: ["Stand feet shoulder width apart.", "Lower hips back and down like sitting in a chair.", "Keep chest up and return to starting position."]
      },
      {
        name: "Shrimp Squats",
        description: "Excellent single-leg knee-dominant builder.",
        sets: 3,
        reps: "6 - 10 per leg",
        instructions: ["Stand on one leg, hold the foot of the other leg behind you.", "Lower down until the back knee lightly touches the floor.", "Drive back up using front leg."]
      }
    ],
    shoulders: [
      {
        name: "Pike Push-ups",
        description: "Vertical push mimicking overhead press.",
        sets: 3,
        reps: "8 - 12 reps",
        instructions: ["Form an inverted 'V' shape with hips high.", "Lower head towards hands by bending elbows.", "Push away dynamically."]
      },
      {
        name: "Handstand Hold against Wall",
        description: "Superb shoulder stability builder.",
        sets: 3,
        reps: "30 - 45 seconds",
        instructions: ["Kick up into a handstand against a wall.", "Keep shoulders active, pushing through the floor.", "Engage core, hold body straight."]
      }
    ],
    arms: [
      {
        name: "Diamond Push-ups",
        description: "Targets triceps and inner chest.",
        sets: 3,
        reps: "10 - 15 reps",
        instructions: ["Form a diamond with hands directly under chest.", "Lower chest to hands, keep elbows close to sides.", "Push up explosively."]
      },
      {
        name: "Bench Dips",
        description: "Focused tricep builder using a ledge.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Hands on bench behind you, legs extended.", "Lower hips by bending elbows to 90 degrees.", "Push back up."]
      }
    ]
  },
  home: {
    chest: [
      {
        name: "Standard Push-ups",
        description: "Full body alignment pushups.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Hands slightly wider than shoulder width.", "Lower body in alignment to the ground.", "Push back up."]
      },
      {
        name: "Incline Couch Push-ups",
        description: "Lower chest activation using home furniture elevation.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Place hands on couch seat, feet on floor.", "Complete push-ups keeping core tight."]
      }
    ],
    back: [
      {
        name: "Superman Hold",
        description: "Strengthens entire posterior chain.",
        sets: 3,
        reps: "30 - 45 seconds",
        instructions: ["Lie face down on stomach.", "Raise arms, chest, and legs off the floor simultaneously.", "Squeeze back muscles and hold."]
      },
      {
        name: "Towel Rows (Door Handle Anchor)",
        description: "Horizontal row utilizing doors at home.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Wrap sturdy towel around door handles.", "Hold ends, lean back, pull chest to door.", "Squeeze shoulder blades."]
      }
    ],
    core: [
      {
        name: "Bicycle Crunches",
        description: "High-activation oblique and rectus abdominis exercise.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Lie on back, hands behind head.", "Bring elbow to opposite knee while extending other leg.", "Alternate sides smoothly."]
      },
      {
        name: "Lying Leg Raises",
        description: "Lower abdominal builder.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Lie flat, hands under glutes.", "Raise legs straight up, then lower slowly without touching floor."]
      }
    ],
    legs: [
      {
        name: "Air Squats",
        description: "Bodyweight leg endurance exercise.",
        sets: 3,
        reps: "20 - 30 reps",
        instructions: ["Squat low, chest up.", "Return to standing, engage glutes."]
      },
      {
        name: "Alternating Lunges",
        description: "Unilateral leg builder.",
        sets: 3,
        reps: "10 per leg",
        instructions: ["Step forward, lower back knee to an inch off floor.", "Drive back up, swap legs."]
      }
    ],
    shoulders: [
      {
        name: "Pike Push-ups",
        description: "Target shoulders using your body angle.",
        sets: 3,
        reps: "8 - 12 reps",
        instructions: ["V-stance, look at feet.", "Lower head, push back up."]
      },
      {
        name: "Arm Circles",
        description: "High rep shoulder burn out.",
        sets: 3,
        reps: "50 circles",
        instructions: ["Extend arms out sideways.", "Make tiny forward circles quickly, keep shoulders loaded."]
      }
    ],
    arms: [
      {
        name: "Diamond Push-ups",
        description: "Home tricep targets.",
        sets: 3,
        reps: "8 - 12 reps",
        instructions: ["Diamond hands, push up.", "Keep core engaged."]
      },
      {
        name: "Chair Dips",
        description: "Tricep conditioning.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Grip edge of sturdy chair seat.", "Extend legs, lower hips, drive up using triceps."]
      }
    ]
  },
  gym: {
    chest: [
      {
        name: "Barbell Bench Press",
        description: "King of chest mass builders.",
        sets: 3,
        reps: "8 - 12 reps",
        instructions: ["Lie flat on bench, grip barbell.", "Lower bar slowly to chest.", "Drive upwards dynamically."]
      },
      {
        name: "Incline Dumbbell Press",
        description: "Upper chest target.",
        sets: 3,
        reps: "8 - 12 reps",
        instructions: ["Sit on incline bench (30-45 deg).", "Press dumbbells vertically overhead."]
      }
    ],
    back: [
      {
        name: "Barbell Deadlift",
        description: "Total posterior chain strength builder.",
        sets: 3,
        reps: "5 - 8 reps",
        instructions: ["Feet under bar, hinge hips, flat back.", "Pull bar up keeping it close to shins.", "Lockout hips at top."]
      },
      {
        name: "Lat Pulldown",
        description: "Vertical pull training.",
        sets: 3,
        reps: "10 - 12 reps",
        instructions: ["Grip bar wide, sit down.", "Pull bar to collarbone, squeeze lats."]
      }
    ],
    core: [
      {
        name: "Cable Crunches",
        description: "Weighted abdominal load.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Kneel below high pulley with rope attachment.", "Crunch downwards, bringing elbows to knees."]
      },
      {
        name: "Captain's Chair Leg Raises",
        description: "Lower ab isolation.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Rest forearms on pads, suspend body.", "Raise legs straight out to parallel, lower slowly."]
      }
    ],
    legs: [
      {
        name: "Barbell Back Squats",
        description: "Fundamental leg builder.",
        sets: 3,
        reps: "8 - 10 reps",
        instructions: ["Bar across upper back, squat down to parallel.", "Drive up through heels."]
      },
      {
        name: "Leg Press",
        description: "Quadriceps heavy push.",
        sets: 3,
        reps: "10 - 12 reps",
        instructions: ["Sit in sled, lower plate to 90 degrees knee bend.", "Press plate up, do not lock knees."]
      }
    ],
    shoulders: [
      {
        name: "Overhead Barbell Press",
        description: "Strict vertical push for shoulders.",
        sets: 3,
        reps: "8 - 10 reps",
        instructions: ["Stand tall, press barbell from collarbone to overhead.", "Lock arms, brace core."]
      },
      {
        name: "Dumbbell Lateral Raises",
        description: "Targets lateral shoulder cap.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Stand with light dumbbells.", "Raise arms to sides parallel to floor, pinky finger higher."]
      }
    ],
    arms: [
      {
        name: "Barbell Bicep Curls",
        description: "Classic bicep mass builder.",
        sets: 3,
        reps: "10 - 12 reps",
        instructions: ["Hold barbell underhand.", "Curl bar up, squeeze biceps, lower with control."]
      },
      {
        name: "Tricep Rope Pushdowns",
        description: "Isolates lateral/medial heads.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Pull rope down from high pulley.", "Flare rope ends at bottom lockout."]
      }
    ]
  },
  band: {
    chest: [
      {
        name: "Banded Chest Fly",
        description: "Banded chest squeeze.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Anchor band behind you.", "Bring hands together in front, squeeze chest."]
      },
      {
        name: "Banded Push-ups",
        description: "Adds progressive resistance to pushups.",
        sets: 3,
        reps: "10 - 12 reps",
        instructions: ["Wrap band around back, hold under hands.", "Execute pushups against band tension."]
      }
    ],
    back: [
      {
        name: "Banded Rows",
        description: "Horizontal pull resistance.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Loop band around feet, sit tall.", "Pull handles to ribs, squeeze shoulder blades."]
      },
      {
        name: "Banded Face Pulls",
        description: "Upper back and rear delt builder.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Anchor band high.", "Pull hands to ears, flaring elbows."]
      }
    ],
    core: [
      {
        name: "Banded Pallof Press",
        description: "Excellent anti-rotation core builder.",
        sets: 3,
        reps: "12 reps per side",
        instructions: ["Anchor band at chest height sideways.", "Hold band at chest, press straight out, resist rotation."]
      },
      {
        name: "Banded Woodchoppers",
        description: "Banded rotational core training.",
        sets: 3,
        reps: "15 reps per side",
        instructions: ["Anchor band high.", "Pull down and across body in diagonal chopping motion."]
      }
    ],
    legs: [
      {
        name: "Banded Squats",
        description: "Adds progressive resistance to squats.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Stand on band, loop top over shoulders.", "Squat low, drive up against band tension."]
      },
      {
        name: "Banded Kickbacks",
        description: "Isolates glutes.",
        sets: 3,
        reps: "15 reps per leg",
        instructions: ["Anchor band low, loop around ankle.", "Kick leg back straight against resistance."]
      }
    ],
    shoulders: [
      {
        name: "Banded Lateral Raises",
        description: "Progressive shoulder load.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Stand on band, lift arms sideways to shoulder height.", "Lower slowly."]
      },
      {
        name: "Banded Overhead Press",
        description: "Vertical shoulder press.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Stand on band, press handles directly overhead from shoulders."]
      }
    ],
    arms: [
      {
        name: "Banded Bicep Curls",
        description: "Constant tension bicep curls.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Stand on band, hold handles underhand.", "Curl up, squeezing biceps."]
      },
      {
        name: "Banded Tricep Pushdowns",
        description: "Isolates triceps.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Anchor band overhead, pull down, locking elbows."]
      }
    ]
  }
}

const BODY_PARTS_INFO: Record<BodyPart, { name: string; stat: string; desc: string }> = {
  chest: { name: 'Chest', stat: 'Endurance (+1)', desc: 'Core buildup for upper body endurance.' },
  back: { name: 'Back', stat: 'Endurance (+1)', desc: 'Strengthen spine and lats for physical posture.' },
  core: { name: 'Core / Abs', stat: 'Stamina (+1)', desc: 'Establish center of gravity and stamina shield.' },
  legs: { name: 'Legs', stat: 'Stamina (+1)', desc: 'Enhance mobility and solid power stance.' },
  shoulders: { name: 'Shoulders', stat: 'Attack Power (+1)', desc: 'Overhead strength loading for damage multipliers.' },
  arms: { name: 'Arms', stat: 'Attack Power (+1)', desc: 'Bicep/Tricep building block for raw combat efficiency.' }
}

export default function WorkoutClient({ initialProfile, initialCompletedNames }: WorkoutClientProps) {
  // Navigation & Screen states
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [completedExercisesToday, setCompletedExercisesToday] = useState<string[]>(initialCompletedNames)
  const [selectedType, setSelectedType] = useState<WorkoutType>('calisthenics')
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart>('chest')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  
  // Active Exercise Training variables
  const [activeSetsCompleted, setActiveSetsCompleted] = useState<boolean[]>([])
  const [submittingWorkout, setSubmittingWorkout] = useState(false)

  // Celebration Overlays State
  const [celebration, setCelebration] = useState({
    active: false,
    levelUpActive: false,
    rankUpActive: false,
    oldLevel: 1,
    newLevel: 1,
    oldRank: 'E-Rank',
    newRank: 'E-Rank'
  })

  // Workout Success notification popup
  const [completionNotify, setCompletionNotify] = useState<{
    visible: boolean
    xpGained: number
    statGained: string
  } | null>(null)

  // 3D Canvas configuration
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [angle, setAngle] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)

  // Autoration when NOT dragging
  useEffect(() => {
    let animationId: number
    const updateRotation = () => {
      if (!isDragging && !activeExercise) {
        setAngle((prev) => (prev + 0.006) % (Math.PI * 2))
      }
      animationId = requestAnimationFrame(updateRotation)
    }
    animationId = requestAnimationFrame(updateRotation)
    return () => cancelAnimationFrame(animationId)
  }, [isDragging, activeExercise])

  // Canvas drawing operations
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Setup clear size
    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    // Render sci-fi background grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)'
    ctx.lineWidth = 1
    const gridSize = 30
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // 3D parameters
    const scale = 110 // Scaling points to canvas
    const cosAngle = Math.cos(angle)
    const sinAngle = Math.sin(angle)

    // Rotate and project points
    const projectedPoints = SKELETON_POINTS.map((pt) => {
      // Rotate around Y-axis
      const rotatedX = pt.x * cosAngle - pt.z * sinAngle
      const rotatedZ = pt.x * sinAngle + pt.z * cosAngle
      
      // Project 3D to 2D
      const px = width / 2 + rotatedX * scale
      const py = height / 2 - (pt.y - 0.4) * scale // centering vertical translation
      
      return {
        px,
        py,
        pz: rotatedZ,
        group: pt.group
      }
    })

    // 1. Draw glowing highlight polygons for selected body part
    if (selectedBodyPart) {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)'
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)'
      ctx.lineWidth = 1.5

      if (selectedBodyPart === 'chest') {
        // Polygon of chest: L Shoulder, R Shoulder, Spine Core
        ctx.beginPath()
        ctx.moveTo(projectedPoints[5].px, projectedPoints[5].py)
        ctx.lineTo(projectedPoints[8].px, projectedPoints[8].py)
        ctx.lineTo(projectedPoints[3].px, projectedPoints[3].py)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'back') {
        // Back uses same region but different color styling
        ctx.fillStyle = 'rgba(139, 92, 246, 0.12)'
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)'
        ctx.beginPath()
        ctx.moveTo(projectedPoints[5].px, projectedPoints[5].py)
        ctx.lineTo(projectedPoints[8].px, projectedPoints[8].py)
        ctx.lineTo(projectedPoints[3].px, projectedPoints[3].py)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'core') {
        // Core polygon: Chest Spine, L Hip, R Hip
        ctx.beginPath()
        ctx.moveTo(projectedPoints[2].px, projectedPoints[2].py)
        ctx.lineTo(projectedPoints[11].px, projectedPoints[11].py)
        ctx.lineTo(projectedPoints[14].px, projectedPoints[14].py)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'legs') {
        // Left thigh
        ctx.beginPath()
        ctx.moveTo(projectedPoints[11].px, projectedPoints[11].py)
        ctx.lineTo(projectedPoints[12].px, projectedPoints[12].py)
        ctx.stroke()
        // Right thigh
        ctx.beginPath()
        ctx.moveTo(projectedPoints[14].px, projectedPoints[14].py)
        ctx.lineTo(projectedPoints[15].px, projectedPoints[15].py)
        ctx.stroke()
      } else if (selectedBodyPart === 'shoulders') {
        // Left & Right shoulder circles
        ctx.beginPath()
        ctx.arc(projectedPoints[5].px, projectedPoints[5].py, 15, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(projectedPoints[8].px, projectedPoints[8].py, 15, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'arms') {
        // Left Arm lines
        ctx.beginPath()
        ctx.moveTo(projectedPoints[5].px, projectedPoints[5].py)
        ctx.lineTo(projectedPoints[6].px, projectedPoints[6].py)
        ctx.lineTo(projectedPoints[7].px, projectedPoints[7].py)
        ctx.stroke()
        // Right Arm lines
        ctx.beginPath()
        ctx.moveTo(projectedPoints[8].px, projectedPoints[8].py)
        ctx.lineTo(projectedPoints[9].px, projectedPoints[9].py)
        ctx.lineTo(projectedPoints[10].px, projectedPoints[10].py)
        ctx.stroke()
      }
    }

    // 2. Draw connections (Bones)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1
    SKELETON_CONNECTIONS.forEach((conn) => {
      const fromPt = projectedPoints[conn.from]
      const toPt = projectedPoints[conn.to]
      
      ctx.beginPath()
      ctx.moveTo(fromPt.px, fromPt.py)
      ctx.lineTo(toPt.px, toPt.py)
      ctx.stroke()
    })

    // 3. Draw keypoints (Joints / Nodes)
    projectedPoints.forEach((pt, index) => {
      // Determine color
      let color = 'rgba(0, 240, 255, 0.4)'
      let size = 3

      if (pt.group === selectedBodyPart) {
        color = '#00f0ff' // Selected active neon glow
        size = 5
      }

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(pt.px, pt.py, size, 0, Math.PI * 2)
      ctx.fill()

      // Outer rings for important joint centers
      if (index === 0 || index === 2 || index === 3 || index === 5 || index === 8) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)'
        ctx.beginPath()
        ctx.arc(pt.px, pt.py, size + 4, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    // Draw HUD overlays on Canvas
    ctx.fillStyle = 'rgba(0, 240, 255, 0.8)'
    ctx.font = '10px monospace'
    ctx.fillText(`SYSTEM MONITORING: ${BODY_PARTS_INFO[selectedBodyPart].name.toUpperCase()}`, 15, 25)
    ctx.fillText(`ROTATION INDEX: ${Math.round((angle * 180) / Math.PI)}°`, 15, 40)
    ctx.fillText('STATUS: ONLINE', 15, 55)

  }, [angle, selectedBodyPart])

  // Click on Canvas handles body part hit-testing
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Project points as we did inside draw
    const width = canvas.width
    const height = canvas.height
    const scale = 110
    const cosAngle = Math.cos(angle)
    const sinAngle = Math.sin(angle)

    const projected = SKELETON_POINTS.map((pt) => {
      const rx = pt.x * cosAngle - pt.z * sinAngle
      const px = width / 2 + rx * scale
      const py = height / 2 - (pt.y - 0.4) * scale
      return { px, py, group: pt.group }
    })

    // Find nearest point
    let nearestPart: BodyPart | null = null
    let minDist = 40 // Click boundary box

    projected.forEach((pt) => {
      if (pt.group) {
        const dx = pt.px - x
        const dy = pt.py - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDist) {
          minDist = dist
          nearestPart = pt.group
        }
      }
    })

    if (nearestPart) {
      setSelectedBodyPart(nearestPart)
    }
  }

  // Handle Drag / Rotate movements
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart
    setAngle((prev) => (prev + deltaX * 0.01) % (Math.PI * 2))
    setDragStart(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Launch Active exercise window
  const startExercise = (ex: Exercise) => {
    setActiveExercise(ex)
    setActiveSetsCompleted(new Array(ex.sets).fill(false))
  }

  // Complete one training set checkmark
  const toggleSetComplete = (index: number) => {
    const nextSets = [...activeSetsCompleted]
    nextSets[index] = !nextSets[index]
    setActiveSetsCompleted(nextSets)
  }

  // Complete system exercise session (records to DB and adds XP)
  const handleCompleteWorkout = async () => {
    if (!activeExercise) return
    
    setSubmittingWorkout(true)
    try {
      const res = await completeWorkoutExercise(
        selectedBodyPart,
        selectedType,
        activeExercise.name
      )

      if (res.error) {
        alert(res.error)
        setSubmittingWorkout(false)
        return
      }

      // Update local profile stats dynamically
      setProfile((prev) => {
        const updated = { ...prev }
        updated.level = res.newLevel ?? prev.level
        updated.rank = res.newRank ?? prev.rank
        const category = getStatCategoryForBodyPart(selectedBodyPart) as 'attack_power' | 'endurance' | 'stamina'
        updated[category] = (updated[category] as number) + 1
        updated.total_xp = prev.total_xp + (res.xpGained ?? 0)
        return updated
      })

      // Add to completed list for today
      setCompletedExercisesToday((prev) => [...prev, activeExercise.name])

      // Handle leveling up or rank-up triggers
      if (res.leveledUp || res.rankedUp) {
        setCelebration({
          active: true,
          levelUpActive: !!res.leveledUp,
          rankUpActive: !!res.rankedUp,
          oldLevel: profile.level,
          newLevel: res.newLevel ?? profile.level,
          oldRank: profile.rank,
          newRank: res.newRank ?? profile.rank
        })
      } else {
        // Regular completion message
        setCompletionNotify({
          visible: true,
          xpGained: res.xpGained ?? 0,
          statGained: BODY_PARTS_INFO[selectedBodyPart].name
        })
      }

      // Return back to list view
      setActiveExercise(null)
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      alert("System transaction error occurred.")
    } finally {
      setSubmittingWorkout(false)
    }
  }

  const activeWorkoutList = EXERCISES_DATA[selectedType][selectedBodyPart] || []

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-gold text-slate-900 tracking-wider">
              S-RANK RESTRICTED
            </span>
          </div>
          <h1 className="text-3xl font-black font-mono tracking-widest text-white mt-1 glow-text-cyan uppercase">
            Physiology Core System
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
            Awaken physical stat nodes. Complete routines to gain daily system elixir.
          </p>
        </div>

        {/* Info badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
            <Calendar className="text-brand-blue" size={18} />
            <div>
              <span className="block text-[8px] text-gray-500 uppercase">RECOVERY RESET</span>
              <span className="text-xs font-mono font-semibold text-white">MIDNIGHT UTC</span>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center gap-3 font-mono">
            <Flame className="text-brand-gold animate-pulse" size={18} />
            <div>
              <span className="block text-[8px] text-gray-500 uppercase">COMPLETED TODAY</span>
              <span className="text-xs font-semibold text-brand-gold">
                {completedExercisesToday.length} Done
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Workout Type Tabs Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(['calisthenics', 'home', 'gym', 'band'] as const).map((type) => {
          const isActive = selectedType === type
          return (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type)
                setIsModalOpen(false)
              }}
              className={`py-3 px-4 rounded-lg text-xs font-bold font-mono tracking-wider transition-all uppercase border cursor-pointer ${
                isActive
                  ? 'bg-brand-blue/15 text-brand-blue border-brand-blue glow-blue'
                  : 'bg-[#0b0f19] text-gray-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {type === 'band' ? 'Resistance Band' : type + ' workout'}
            </button>
          )
        })}
      </div>

      {/* 3. Main Workspace (3D model + details panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Holographic 3D Canvas Box (7 columns) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden flex flex-col items-center">
          
          {/* Neon grid scan lines overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-brand-blue/[0.02] to-transparent bg-[size:100%_4px] animate-scanline" />
          
          <div className="w-full flex items-center justify-between z-10">
            <span className="text-[10px] text-brand-blue/60 tracking-widest font-mono">
              [ NEURAL PHYSIOLOGY LINK ACTIVE ]
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
              <Info size={11} />
              <span>DRAG TO ROTATE MODEL</span>
            </div>
          </div>

          {/* Interactive Canvas */}
          <div className="relative my-4 cursor-grab active:cursor-grabbing select-none">
            <canvas
              ref={canvasRef}
              width={350}
              height={420}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="bg-transparent border border-slate-900 rounded-lg max-w-full"
            />

            {/* Glowing indicators */}
            <div className="absolute top-1/2 left-2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none select-none font-mono">
              <span className="text-[8px] text-brand-blue/30">CAM_01_L</span>
              <div className="w-3 h-[1px] bg-brand-blue/30" />
            </div>
            <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col items-end gap-1 pointer-events-none select-none font-mono">
              <span className="text-[8px] text-brand-blue/30">GRID_ALIGN</span>
              <div className="w-3 h-[1px] bg-brand-blue/30" />
            </div>
          </div>

          <div className="w-full flex justify-between z-10 border-t border-slate-900 pt-3">
            <button
              onClick={() => setAngle((prev) => (prev - Math.PI / 4) % (Math.PI * 2))}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-brand-blue rounded border border-slate-800 text-[10px] font-mono transition-all cursor-pointer"
            >
              Rotate Left
            </button>
            <button
              onClick={() => setSelectedBodyPart((prev) => {
                const parts: BodyPart[] = ['chest', 'back', 'shoulders', 'arms', 'core', 'legs']
                const idx = (parts.indexOf(prev) + 1) % parts.length
                return parts[idx]
              })}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-brand-blue rounded border border-slate-800 text-[10px] font-mono transition-all cursor-pointer"
            >
              Switch Node
            </button>
            <button
              onClick={() => setAngle((prev) => (prev + Math.PI / 4) % (Math.PI * 2))}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-brand-blue rounded border border-slate-800 text-[10px] font-mono transition-all cursor-pointer"
            >
              Rotate Right
            </button>
          </div>
        </div>

        {/* Selector Panel (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <h3 className="text-xs text-brand-blue tracking-widest font-mono uppercase mb-4">
              Physiological Sectors
            </h3>

            {/* Muscle group selector buttons list */}
            <div className="space-y-2">
              {Object.keys(BODY_PARTS_INFO).map((key) => {
                const part = key as BodyPart
                const info = BODY_PARTS_INFO[part]
                const isSelected = selectedBodyPart === part
                const countCompleted = activeWorkoutList.filter(ex => 
                  completedExercisesToday.includes(ex.name)
                ).length

                return (
                  <button
                    key={part}
                    onClick={() => setSelectedBodyPart(part)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900/80 border-brand-blue text-white glow-blue'
                        : 'bg-slate-950/40 border-slate-800/80 text-gray-400 hover:border-slate-700 hover:text-gray-200'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold uppercase">{info.name} Node</span>
                      <span className="block text-[9px] text-gray-500 mt-0.5">{info.desc}</span>
                    </div>
                    <div className="text-right">
                      <span className={`block text-[10px] font-bold ${isSelected ? 'text-brand-blue' : 'text-gray-400'}`}>
                        {info.stat}
                      </span>
                      <span className="block text-[9px] text-slate-500 mt-0.5">
                        {countCompleted === activeWorkoutList.length ? 'ALL DONE' : `${countCompleted}/${activeWorkoutList.length} Completed`}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick exercise launch card */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 relative overflow-hidden font-mono">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/[0.01] rounded-full filter blur-xl pointer-events-none" />
            <h3 className="text-xs text-brand-blue tracking-widest uppercase mb-1">
              Sector Briefing
            </h3>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              {BODY_PARTS_INFO[selectedBodyPart].name} Nodes
            </h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              {BODY_PARTS_INFO[selectedBodyPart].desc} Selected workout type: <span className="text-brand-blue uppercase font-bold">{selectedType === 'band' ? 'Resistance Band' : selectedType}</span>.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4 py-3 bg-brand-blue/15 hover:bg-brand-blue/30 text-brand-blue border border-brand-blue/40 hover:border-brand-blue rounded-lg text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Dumbbell size={14} />
              <span>Awaken Training Room</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Workout Modal (Interactive lists of selected sector workouts) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#070b13] border border-brand-blue/60 rounded-xl p-6 glow-blue max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[9px] text-brand-blue/60 uppercase">SECTOR OVERVIEW</span>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider mt-0.5">
                    {BODY_PARTS_INFO[selectedBodyPart].name} - {selectedType === 'band' ? 'Resistance Band' : selectedType}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-gray-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Exercises List */}
              <div className="space-y-4">
                {activeWorkoutList.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">No routines listed for this node setup.</p>
                ) : (
                  activeWorkoutList.map((ex) => {
                    const isDone = completedExercisesToday.includes(ex.name)

                    return (
                      <div
                        key={ex.name}
                        className={`p-4 rounded-lg border transition-all ${
                          isDone
                            ? 'bg-slate-950/60 border-slate-900 opacity-60'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                            <p className="text-[11px] text-gray-400 mt-1">{ex.description}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] text-brand-blue font-bold tracking-wider">
                            {ex.sets}S x {ex.reps}
                          </span>
                        </div>

                        {/* Instructions preview */}
                        <div className="mt-3 bg-slate-950/40 p-2.5 rounded text-[10px] text-gray-400 space-y-1">
                          <span className="block font-semibold text-slate-500 uppercase text-[8px]">PROMPT METHOD:</span>
                          {ex.instructions.map((inst, i) => (
                            <p key={i}>• {inst}</p>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 flex items-center justify-between">
                          {isDone ? (
                            <span className="flex items-center gap-1.5 text-xs text-brand-blue font-bold">
                              <CheckCircle size={14} />
                              <span>COMPLETED (+2-5 XP)</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => startExercise(ex)}
                              className="px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 hover:border-brand-blue rounded text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Play size={12} />
                              <span>Initiate Workout</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Immersive Active Training Zone Screen (Fullscreen Overlay) */}
      <AnimatePresence>
        {activeExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#02050c]/98 backdrop-blur-md overflow-y-auto p-4 md:p-8 flex items-center justify-center font-mono"
          >
            {/* Sci-fi layout brackets */}
            <div className="absolute top-4 left-4 text-[9px] text-brand-blue/40 tracking-wider">
              [ SECTOR: {selectedBodyPart.toUpperCase()} | SYSTEM_ZONE ]
            </div>
            
            <div className="w-full max-w-2xl bg-slate-950 border-2 border-brand-blue rounded-xl p-6 md:p-8 relative glow-blue my-auto">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-blue" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-blue" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-blue" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-blue" />

              {/* Back Button */}
              <button
                onClick={() => setActiveExercise(null)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white uppercase transition-all mb-6 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Abort Training Room</span>
              </button>

              <div className="space-y-6">
                
                {/* Title */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[8px] bg-brand-blue/15 text-brand-blue font-bold tracking-widest uppercase">
                      ACTIVE TRAINING
                    </span>
                    <span className="px-2 py-0.5 rounded text-[8px] bg-slate-900 text-slate-400 font-bold tracking-widest uppercase">
                      {selectedType}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-widest uppercase mt-2 border-b border-slate-800 pb-3">
                    {activeExercise.name}
                  </h2>
                </div>

                {/* Instructions */}
                <div className="bg-[#0b0f19]/60 border border-slate-900 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info size={12} />
                    <span>System Protocol Instructions</span>
                  </h4>
                  <ul className="text-xs text-gray-300 space-y-2 pl-1 list-none">
                    {activeExercise.instructions.map((inst, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-brand-blue">{i + 1}.</span>
                        <span>{inst}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Stat details */}
                <div className="flex items-center gap-4 bg-slate-900/30 border border-slate-950 p-4 rounded-lg">
                  <Award className="text-brand-gold animate-bounce" size={24} />
                  <div>
                    <span className="block text-[9px] text-gray-500 uppercase font-bold">COMPLETION ELIXIR AWARDED</span>
                    <span className="text-xs font-bold text-white">
                      Adds <span className="text-brand-gold font-mono font-black">+2 - +5 XP</span> & <span className="text-brand-blue uppercase">{BODY_PARTS_INFO[selectedBodyPart].stat}</span> to credentials upon successful sets checkout.
                    </span>
                  </div>
                </div>

                {/* Sets check-off tracker */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    REPETITIONS SET LOG
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeSetsCompleted.map((completed, index) => (
                      <button
                        key={index}
                        onClick={() => toggleSetComplete(index)}
                        className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                          completed
                            ? 'bg-brand-blue/10 border-brand-blue text-white glow-blue'
                            : 'bg-slate-900 border-slate-800 text-gray-500 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400">SET 0{index + 1}</span>
                        <span className={`text-sm font-black ${completed ? 'text-brand-blue' : 'text-gray-300'}`}>
                          {activeExercise.reps}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
                          completed
                            ? 'border-brand-blue bg-brand-blue text-slate-950'
                            : 'border-slate-700'
                        }`}>
                          {completed && <CheckCircle size={14} className="stroke-[3]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Final Complete Button */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    disabled={!activeSetsCompleted.every(Boolean) || submittingWorkout}
                    onClick={handleCompleteWorkout}
                    className={`w-full py-4 rounded-lg font-black tracking-widest text-xs uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeSetsCompleted.every(Boolean) && !submittingWorkout
                        ? 'bg-brand-blue text-slate-950 border border-brand-blue hover:shadow-lg hover:shadow-brand-blue/20'
                        : 'bg-slate-900 border border-slate-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {submittingWorkout ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        <span>SYNCHRONIZING WITH SYSTEM DATABASE...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>COMPLETE SYSTEM WORKOUT</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Success notification popup for standard completions */}
      <AnimatePresence>
        {completionNotify?.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#070b13] border border-brand-blue p-5 rounded-lg shadow-2xl glow-blue font-mono max-w-sm"
          >
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-brand-blue/10 border border-brand-blue/30 rounded-full text-brand-blue">
                <CheckCircle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-brand-blue uppercase tracking-widest">
                  Routine Synchronized
                </h4>
                <p className="text-[11px] text-gray-300 mt-1">
                  You successfully executed the routine reps. The system database awards you credentials:
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-brand-gold">
                    +{completionNotify.xpGained} XP
                  </span>
                  <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-brand-blue">
                    +{completionNotify.statGained} STAT
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCompletionNotify(null)}
              className="mt-4 w-full py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-gray-400 hover:text-white rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer"
            >
              Verify Credentials
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Level Up & Rank Up Celebration Overlay */}
      <CelebrationOverlays
        levelUpActive={celebration.levelUpActive}
        rankUpActive={celebration.rankUpActive}
        oldLevel={celebration.oldLevel}
        newLevel={celebration.newLevel}
        oldRank={celebration.oldRank}
        newRank={celebration.newRank}
        onClose={() => setCelebration((prev) => ({ ...prev, levelUpActive: false, rankUpActive: false }))}
      />
    </div>
  )
}
