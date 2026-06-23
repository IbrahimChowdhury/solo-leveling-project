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
type BodyPart = 'neck' | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'core' | 'thighs' | 'calves'

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

// 3D model vertices for the holographic human figure (10 nodes)
const SKELETON_POINTS: Point3D[] = [
  { x: 0, y: 1.6, z: 0, name: 'Head' }, // 0
  { x: 0, y: 1.45, z: 0, name: 'Neck', group: 'neck' }, // 1 (Neck/Ghar)
  { x: 0, y: 1.1, z: 0.05, name: 'Chest', group: 'chest' }, // 2 (Chest front)
  { x: 0, y: 1.1, z: -0.05, name: 'Back', group: 'back' }, // 3 (Back/Lats back)
  { x: 0, y: 0.75, z: 0.04, name: 'Abs', group: 'core' }, // 4 (Core front)
  { x: 0, y: 0.4, z: 0, name: 'Pelvis' }, // 5
  
  // Left Shoulder & Arm
  { x: -0.38, y: 1.3, z: 0, name: 'L_Shoulder', group: 'shoulders' }, // 6
  { x: -0.48, y: 1.05, z: 0.06, name: 'L_Bicep', group: 'biceps' }, // 7
  { x: -0.48, y: 1.05, z: -0.06, name: 'L_Tricep', group: 'triceps' }, // 8
  { x: -0.58, y: 0.85, z: 0, name: 'L_Elbow' }, // 9
  { x: -0.65, y: 0.65, z: 0, name: 'L_Forearm', group: 'forearms' }, // 10
  { x: -0.72, y: 0.5, z: 0, name: 'L_Wrist' }, // 11
  
  // Right Shoulder & Arm
  { x: 0.38, y: 1.3, z: 0, name: 'R_Shoulder', group: 'shoulders' }, // 12
  { x: 0.48, y: 1.05, z: 0.06, name: 'R_Bicep', group: 'biceps' }, // 13
  { x: 0.48, y: 1.05, z: -0.06, name: 'R_Tricep', group: 'triceps' }, // 14
  { x: 0.58, y: 0.85, z: 0, name: 'R_Elbow' }, // 15
  { x: 0.65, y: 0.65, z: 0, name: 'R_Forearm', group: 'forearms' }, // 16
  { x: 0.72, y: 0.5, z: 0, name: 'R_Wrist' }, // 17

  // Left Leg
  { x: -0.18, y: 0.4, z: 0, name: 'L_Hip' }, // 18
  { x: -0.20, y: 0.1, z: 0.04, name: 'L_Thigh', group: 'thighs' }, // 19
  { x: -0.22, y: -0.15, z: 0, name: 'L_Knee' }, // 20
  { x: -0.23, y: -0.45, z: -0.04, name: 'L_Calf', group: 'calves' }, // 21
  { x: -0.24, y: -0.75, z: 0, name: 'L_Ankle' }, // 22

  // Right Leg
  { x: 0.18, y: 0.4, z: 0, name: 'R_Hip' }, // 23
  { x: 0.20, y: 0.1, z: 0.04, name: 'R_Thigh', group: 'thighs' }, // 24
  { x: 0.22, y: -0.15, z: 0, name: 'R_Knee' }, // 25
  { x: 0.23, y: -0.45, z: -0.04, name: 'R_Calf', group: 'calves' }, // 26
  { x: 0.24, y: -0.75, z: 0, name: 'R_Ankle' }  // 27
]

const SKELETON_CONNECTIONS: Connection[] = [
  { from: 0, to: 1 }, // Head to Neck
  { from: 1, to: 2 }, // Neck to Chest
  { from: 1, to: 3 }, // Neck to Back
  { from: 2, to: 4 }, // Chest to Abs
  { from: 3, to: 4 }, // Back to Abs
  { from: 4, to: 5 }, // Abs to Pelvis
  
  // Left Arm
  { from: 1, to: 6 }, // Neck to L Shoulder
  { from: 6, to: 7 }, // Shoulder to L Bicep
  { from: 6, to: 8 }, // Shoulder to L Tricep
  { from: 7, to: 9 }, // Bicep to Elbow
  { from: 8, to: 9 }, // Tricep to Elbow
  { from: 9, to: 10 }, // Elbow to Forearm
  { from: 10, to: 11 }, // Forearm to Wrist
  
  // Right Arm
  { from: 1, to: 12 }, // Neck to R Shoulder
  { from: 12, to: 13 }, // Shoulder to R Bicep
  { from: 12, to: 14 }, // Shoulder to R Tricep
  { from: 13, to: 15 }, // Bicep to Elbow
  { from: 14, to: 15 }, // Tricep to Elbow
  { from: 15, to: 16 }, // Elbow to Forearm
  { from: 16, to: 17 }, // Forearm to Wrist

  // Left Leg
  { from: 5, to: 18 }, // Pelvis to L Hip
  { from: 18, to: 19 }, // Hip to Thigh
  { from: 19, to: 20 }, // Thigh to Knee
  { from: 20, to: 21 }, // Knee to Calf
  { from: 21, to: 22 }, // Calf to Ankle

  // Right Leg
  { from: 5, to: 23 }, // Pelvis to R Hip
  { from: 23, to: 24 }, // Hip to Thigh
  { from: 24, to: 25 }, // Thigh to Knee
  { from: 25, to: 26 }, // Knee to Calf
  { from: 26, to: 27 }  // Calf to Ankle
]

// The workout dataset mapped by type and body parts
const EXERCISES_DATA: Record<WorkoutType, Record<BodyPart, Exercise[]>> = {
  calisthenics: {
    neck: [
      {
        name: "Neck Flexion Curls",
        description: "Strengthen front neck muscles using head weight.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Lie flat on back on a floor/bench, head hanging off edge.", "Slowly lower head backward.", "Tuck chin and lift head forward, squeezing neck muscles."]
      },
      {
        name: "Neck Extension Raises",
        description: "Build posterior neck and upper traps posture.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Lie face down on stomach, head hanging off edge.", "Lower head down slowly.", "Raise head upward, looking at the ceiling, squeeze posterior neck."]
      }
    ],
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
        name: "Inverted Rows",
        description: "Excellent horizontal pulling movement.",
        sets: 3,
        reps: "10 - 15 reps",
        instructions: ["Use a low bar, hang underneath with heels on floor.", "Pull chest to the bar, keeping body straight.", "Slowly lower back down."]
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
    biceps: [
      {
        name: "Underhand Chin-ups (Bicep Focus)",
        description: "Vertical pull modified to overload biceps.",
        sets: 3,
        reps: "6 - 10 reps",
        instructions: ["Hang from a bar with narrow underhand grip.", "Pull body up focusing on elbow flexion.", "Lower under slow bicep load."]
      },
      {
        name: "Underhand Inverted Rows",
        description: "Horizontal pull modified for bicep stimulation.",
        sets: 3,
        reps: "10 - 12 reps",
        instructions: ["Hang underneath a low bar with underhand grip.", "Pull chest up to the bar, engaging biceps.", "Slowly extend arms."]
      }
    ],
    triceps: [
      {
        name: "Diamond Push-ups",
        description: "Targets triceps and inner chest.",
        sets: 3,
        reps: "10 - 15 reps",
        instructions: ["Form a diamond with hands directly under chest.", "Lower chest to hands, keep elbows close to sides.", "Push up explosively."]
      },
      {
        name: "Parallel Bar Dips (Tricep Focus)",
        description: "Strict vertical dip for posterior arm loading.",
        sets: 3,
        reps: "8 - 12 reps",
        instructions: ["Keep torso perfectly upright on parallel bars.", "Lower straight down, keeping elbows close to body.", "Lock out arms at top."]
      }
    ],
    forearms: [
      {
        name: "Dead Hang",
        description: "Improves grip strength and forearm endurance.",
        sets: 3,
        reps: "45 - 60 seconds",
        instructions: ["Hang freely from a pull-up bar.", "Keep core engaged, do not let shoulders collapse.", "Hold as long as possible under strict forearm load."]
      },
      {
        name: "Active Fingertip Plank",
        description: "Strengthens finger extensors and flexor compartments.",
        sets: 3,
        reps: "30 - 45 seconds",
        instructions: ["Get into plank stance supported by fingertips, not palms.", "Keep body in straight line.", "Breathe and maintain steady static load."]
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
    thighs: [
      {
        name: "Pistol Squats",
        description: "Elite single-leg squat for balance and strength.",
        sets: 3,
        reps: "5 - 8 per leg",
        instructions: ["Stand on one leg, extend other leg straight out.", "Squat down on standing leg as low as possible.", "Drive back up to standing."]
      },
      {
        name: "Bulgarian Split Squats",
        description: "Unilateral thigh overload.",
        sets: 3,
        reps: "10 - 12 per leg",
        instructions: ["Place rear foot on elevated ledge behind you.", "Lower hips until front thigh is parallel to floor.", "Push through front heel to return."]
      }
    ],
    calves: [
      {
        name: "Single-leg Calf Raises",
        description: "Isolates calf muscles with body weight.",
        sets: 3,
        reps: "15 - 20 per leg",
        instructions: ["Stand on one leg at the edge of a step.", "Lower heel below step level.", "Push up onto toes as high as possible, hold, then lower."]
      },
      {
        name: "Calf Hops",
        description: "Elastic calf tendon conditioning.",
        sets: 3,
        reps: "25 - 30 hops",
        instructions: ["Bounce vertically using only ankle joints.", "Keep knees soft but do not bend them to jump.", "Land on balls of feet."]
      }
    ]
  },
  home: {
    neck: [
      {
        name: "Towel Isometric Neck Pulls",
        description: "Neck strengthening utilizing a towel for resistance.",
        sets: 3,
        reps: "15 seconds hold",
        instructions: ["Loop a clean towel behind head, hold ends.", "Pull towel forward while pushing head back, resisting movement.", "Repeat for front and sides."]
      }
    ],
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
    shoulders: [
      {
        name: "Decline Pike Hold",
        description: "Static shoulder load training.",
        sets: 3,
        reps: "30 - 45 seconds",
        instructions: ["Elevate feet on chair, keep hips high in pike position.", "Hold weight on shoulders, arms locked."]
      },
      {
        name: "Arm Circles",
        description: "High rep shoulder burn out.",
        sets: 3,
        reps: "50 circles",
        instructions: ["Extend arms out sideways.", "Make tiny forward circles quickly, keep shoulders loaded."]
      }
    ],
    biceps: [
      {
        name: "Water Bottle Curls",
        description: "Improvised home bicep curl.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Hold heavy bottles/water jugs in hands.", "Flex elbow under control to curl upward.", "Squeeze at top, lower slowly."]
      },
      {
        name: "Door Frame Bicep Pulls",
        description: "Isometric bicep pulling.",
        sets: 3,
        reps: "12 reps per arm",
        instructions: ["Stand close to a door frame.", "Grip the frame underhand, lean back.", "Use bicep to pull your chest to the frame."]
      }
    ],
    triceps: [
      {
        name: "Chair Dips",
        description: "Tricep conditioning using furniture.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Grip edge of sturdy chair seat.", "Extend legs forward, lower hips by bending elbows.", "Drive up using triceps."]
      },
      {
        name: "Overhead Jug Extensions",
        description: "Overhead tricep extension using water jugs.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Hold heavy jug with both hands behind head.", "Keep elbows pointing forward.", "Extend arms upward overhead, lower slowly."]
      }
    ],
    forearms: [
      {
        name: "Towel Wringing",
        description: "Excellent grip and forearm workout.",
        sets: 3,
        reps: "10 twist reps",
        instructions: ["Wet a towel (or use dry).", "Grip towel and twist ends in opposite directions.", "Wring with maximum forearm power."]
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
    thighs: [
      {
        name: "Bodyweight Squats",
        description: "Bodyweight leg conditioning.",
        sets: 3,
        reps: "20 - 25 reps",
        instructions: ["Stand feet shoulder width apart.", "Lower hips back and down.", "Push through heels to return."]
      },
      {
        name: "Walking Lunges",
        description: "Lower body forward strides.",
        sets: 3,
        reps: "12 steps per leg",
        instructions: ["Take a large step forward, lower hips.", "Push off front foot, step forward with other leg."]
      }
    ],
    calves: [
      {
        name: "Floor Calf Raises",
        description: "Basic calf builder.",
        sets: 3,
        reps: "25 - 30 reps",
        instructions: ["Stand feet flat on the floor.", "Rise up onto balls of feet, squeeze calves.", "Lower slowly."]
      }
    ]
  },
  gym: {
    neck: [
      {
        name: "Harness Neck Extensions",
        description: "Weighted neck posture builder.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Attach light plate to neck harness.", "Hinge forward slightly, raise head backward against load.", "Keep motion smooth, do not jerk."]
      }
    ],
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
    biceps: [
      {
        name: "Barbell Bicep Curls",
        description: "Classic bicep builder.",
        sets: 3,
        reps: "10 - 12 reps",
        instructions: ["Grip bar shoulder width underhand.", "Curl bar up without rocking torso.", "Lower slowly."]
      },
      {
        name: "Dumbbell Hammer Curls",
        description: "Targets biceps and brachialis.",
        sets: 3,
        reps: "10 - 12 reps",
        instructions: ["Hold dumbbells with neutral grip (palms facing).", "Curl dumbbells upward, keeping neutral alignment."]
      }
    ],
    triceps: [
      {
        name: "Tricep Rope Pushdowns",
        description: "Tricep lateral and medial heads focus.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Pull rope down from high pulley, locking elbows.", "Flare rope ends at bottom lockout."]
      },
      {
        name: "Barbell Skull Crushers",
        description: "Excellent extension builder.",
        sets: 3,
        reps: "8 - 12 reps",
        instructions: ["Lie on flat bench, hold barbell straight up.", "Lower bar to forehead by bending elbows.", "Press back to vertical."]
      }
    ],
    forearms: [
      {
        name: "Barbell Wrist Curls",
        description: "Isolates wrist flexors.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Sit on bench, hold barbell underhand, forearms on thighs.", "Curl wrist upward, squeeze forearms.", "Lower bar under control."]
      },
      {
        name: "Dumbbell Farmer's Carry",
        description: "Heavy loaded carry for grip mass.",
        sets: 3,
        reps: "40 meters",
        instructions: ["Pick up heavy dumbbells, stand tall.", "Walk with steady controlled steps, keep grip locked."]
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
    thighs: [
      {
        name: "Barbell Back Squats",
        description: "Fundamental leg strength builder.",
        sets: 3,
        reps: "8 - 10 reps",
        instructions: ["Bar across upper back, squat down to parallel.", "Drive up through heels."]
      },
      {
        name: "Leg Extensions",
        description: "Quadriceps isolation.",
        sets: 3,
        reps: "10 - 12 reps",
        instructions: ["Sit on machine, hook ankles behind pads.", "Extend legs straight out, squeeze quads, lower slowly."]
      }
    ],
    calves: [
      {
        name: "Standing Calf Raises",
        description: "Weighted calf building.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Stand on calf raise platform, shoulders under pads.", "Raise heels as high as possible, hold, lower slowly."]
      }
    ]
  },
  band: {
    neck: [
      {
        name: "Banded Neck Resisted Flexion",
        description: "Resisted head movements using elastic bands.",
        sets: 3,
        reps: "12 - 15 reps",
        instructions: ["Anchor band at head level.", "Loop band around forehead, step back to tension.", "Slowly nod head forward against resistance."]
      }
    ],
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
    biceps: [
      {
        name: "Banded Bicep Curls",
        description: "Constant tension curls.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Stand on band, hold handles underhand.", "Curl handles upwards, squeeze biceps at top."]
      }
    ],
    triceps: [
      {
        name: "Banded Tricep Pushdowns",
        description: "Isolates triceps overhead/downwards.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Anchor band high, pull down keeping elbows fixed.", "Lock out arms, squeeze triceps."]
      }
    ],
    forearms: [
      {
        name: "Banded Wrist Curls",
        description: "Improves forearm thickness.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Stand on band, loop end around hands, forearms flat on table.", "Curl wrists upward against elastic tension."]
      }
    ],
    core: [
      {
        name: "Banded Pallof Press",
        description: "Anti-rotation static hold.",
        sets: 3,
        reps: "12 reps per side",
        instructions: ["Anchor band chest high sideways.", "Hold band at chest, press out straight, resist turning."]
      }
    ],
    thighs: [
      {
        name: "Banded Squats",
        description: "Squat overload.",
        sets: 3,
        reps: "15 - 20 reps",
        instructions: ["Stand on band, loop top over shoulders.", "Squat low, rise against elastic resistance."]
      }
    ],
    calves: [
      {
        name: "Banded Calf Flexion",
        description: "Seated calf presses.",
        sets: 3,
        reps: "20 - 25 reps",
        instructions: ["Sit on floor, loop band around ball of foot.", "Hold ends, press foot forward against band, squeeze calf."]
      }
    ]
  }
}

const BODY_PARTS_INFO: Record<BodyPart, { name: string; stat: string; desc: string }> = {
  neck: { name: 'Neck / Ghar', stat: 'Endurance (+1)', desc: 'Stabilize posture and heavy weight holding.' },
  chest: { name: 'Chest', stat: 'Endurance (+1)', desc: 'Core buildup for upper body endurance.' },
  back: { name: 'Back / Lats', stat: 'Endurance (+1)', desc: 'Strengthen spine and lats for physical posture.' },
  shoulders: { name: 'Shoulders', stat: 'Attack Power (+1)', desc: 'Overhead strength loading for damage multipliers.' },
  biceps: { name: 'Biceps', stat: 'Attack Power (+1)', desc: 'Bicep pulling load for raw lifting strength.' },
  triceps: { name: 'Triceps', stat: 'Attack Power (+1)', desc: 'Tricep pushing load for dynamic punching/striking.' },
  forearms: { name: 'Forearms', stat: 'Attack Power (+1)', desc: 'Grip strength and heavy physical handling capability.' },
  core: { name: 'Core / Abs', stat: 'Stamina (+1)', desc: 'Establish center of gravity and stamina shield.' },
  thighs: { name: 'Thighs / Quads', stat: 'Stamina (+1)', desc: 'Leg drive and lower-body explosion power.' },
  calves: { name: 'Calves', stat: 'Stamina (+1)', desc: 'Ankle spring and rapid dynamic movement speed.' }
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

      if (selectedBodyPart === 'neck') {
        // Neck Circle
        ctx.beginPath()
        ctx.arc(projectedPoints[1].px, projectedPoints[1].py, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'chest') {
        // Polygon of chest: L Shoulder (6), R Shoulder (12), Abs (4)
        ctx.beginPath()
        ctx.moveTo(projectedPoints[6].px, projectedPoints[6].py)
        ctx.lineTo(projectedPoints[12].px, projectedPoints[12].py)
        ctx.lineTo(projectedPoints[4].px, projectedPoints[4].py)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'back') {
        // Back uses same region but different color styling
        ctx.fillStyle = 'rgba(139, 92, 246, 0.12)'
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)'
        ctx.beginPath()
        ctx.moveTo(projectedPoints[6].px, projectedPoints[6].py)
        ctx.lineTo(projectedPoints[12].px, projectedPoints[12].py)
        ctx.lineTo(projectedPoints[5].px, projectedPoints[5].py)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'core') {
        // Core polygon: Chest Spine (2), L Hip (18), R Hip (23)
        ctx.beginPath()
        ctx.moveTo(projectedPoints[2].px, projectedPoints[2].py)
        ctx.lineTo(projectedPoints[18].px, projectedPoints[18].py)
        ctx.lineTo(projectedPoints[23].px, projectedPoints[23].py)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'shoulders') {
        // Left & Right shoulder circles (6, 12)
        ctx.beginPath()
        ctx.arc(projectedPoints[6].px, projectedPoints[6].py, 18, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(projectedPoints[12].px, projectedPoints[12].py, 18, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'biceps') {
        // Bicep points (7, 13)
        ctx.beginPath()
        ctx.arc(projectedPoints[7].px, projectedPoints[7].py, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(projectedPoints[13].px, projectedPoints[13].py, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'triceps') {
        // Tricep points (8, 14)
        ctx.fillStyle = 'rgba(139, 92, 246, 0.12)'
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)'
        ctx.beginPath()
        ctx.arc(projectedPoints[8].px, projectedPoints[8].py, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(projectedPoints[14].px, projectedPoints[14].py, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'forearms') {
        // Forearm points (10, 16)
        ctx.beginPath()
        ctx.arc(projectedPoints[10].px, projectedPoints[10].py, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(projectedPoints[16].px, projectedPoints[16].py, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'thighs') {
        // Thigh points (19, 24)
        ctx.beginPath()
        ctx.arc(projectedPoints[19].px, projectedPoints[19].py, 16, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(projectedPoints[24].px, projectedPoints[24].py, 16, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (selectedBodyPart === 'calves') {
        // Calf points (21, 26)
        ctx.beginPath()
        ctx.arc(projectedPoints[21].px, projectedPoints[21].py, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(projectedPoints[26].px, projectedPoints[26].py, 12, 0, Math.PI * 2)
        ctx.fill()
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
                const parts: BodyPart[] = ['neck', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'core', 'thighs', 'calves']
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
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                              <a
                                href={`https://www.youtube.com/results?search_query=how+to+do+${encodeURIComponent(ex.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white border border-red-900/50 hover:border-red-500 rounded text-[9px] font-bold uppercase transition-all"
                                title="Watch tutorial on YouTube"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span>Watch Guide</span>
                              </a>
                            </div>
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
                              <span>COMPLETED (+5-10 XP)</span>
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
                      Adds <span className="text-brand-gold font-mono font-black">+5 - +10 XP</span> & <span className="text-brand-blue uppercase">{BODY_PARTS_INFO[selectedBodyPart].stat}</span> to credentials upon successful sets checkout.
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
