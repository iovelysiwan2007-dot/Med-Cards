export interface Muscle {
  id: string;
  name: string;
  region: 'Upper Limb' | 'Lower Limb' | 'Trunk';
  description: string;
  origin: string;
  insertion: string;
  action: string;
  nerveSupply: string;
  clinicalRelevance: string;
}

export const muscles: Muscle[] = [
  // --- UPPER LIMB ---
  {
    id: 'deltoid',
    name: 'Deltoid',
    region: 'Upper Limb',
    description: 'Large triangular muscle covering the shoulder joint, giving it a rounded contour.',
    origin: 'Lateral third of clavicle, acromion, and spine of scapula.',
    insertion: 'Deltoid tuberosity of humerus.',
    action: 'Anterior part: Flexion and medial rotation of arm. Middle part: Abduction of arm (15 to 90 degrees). Posterior part: Extension and lateral rotation of arm.',
    nerveSupply: 'Axillary nerve (C5, C6).',
    clinicalRelevance: 'Common intramuscular injection site. Injury to axillary nerve (from shoulder dislocation or fracture of surgical neck of humerus) causes deltoid atrophy and loss of arm abduction between 15 and 90 degrees.'
  },
  {
    id: 'supraspinatus',
    name: 'Supraspinatus',
    region: 'Upper Limb',
    description: 'A rotator cuff muscle residing in the supraspinous fossa of the scapula.',
    origin: 'Supraspinous fossa of scapula.',
    insertion: 'Greater tubercle of humerus (superior facet).',
    action: 'Initiates abduction of the arm (first 15 degrees) and stabilizes the humeral head in the glenoid cavity.',
    nerveSupply: 'Suprascapular nerve (C5, C6).',
    clinicalRelevance: 'The most common rotator cuff muscle to be torn or affected by tendinitis/impingement syndrome, leading to a painful arc of abduction between 60 and 120 degrees.'
  },
  {
    id: 'infraspinatus',
    name: 'Infraspinatus',
    region: 'Upper Limb',
    description: 'A thick, triangular rotator cuff muscle occupying the infraspinous fossa.',
    origin: 'Infraspinous fossa of scapula.',
    insertion: 'Greater tubercle of humerus (middle facet).',
    action: 'Lateral (external) rotation of the arm; stabilizes humeral head in glenoid cavity.',
    nerveSupply: 'Suprascapular nerve (C5, C6).',
    clinicalRelevance: 'Frequently involved in rotator cuff tears; crucial for throwing activities and decelerating the arm during overhead movements.'
  },
  {
    id: 'teres-minor',
    name: 'Teres Minor',
    region: 'Upper Limb',
    description: 'A narrow, elongated rotator cuff muscle lying below the infraspinatus.',
    origin: 'Upper two-thirds of lateral border of scapula.',
    insertion: 'Greater tubercle of humerus (inferior facet).',
    action: 'Lateral rotation and weak adduction of the arm; stabilizes humeral head in glenoid cavity.',
    nerveSupply: 'Axillary nerve (C5, C6).',
    clinicalRelevance: 'Component of the rotator cuff. Injury to the axillary nerve affects both the Deltoid and Teres Minor, weakening external rotation and abduction.'
  },
  {
    id: 'subscapularis',
    name: 'Subscapularis',
    region: 'Upper Limb',
    description: 'Large triangular rotator cuff muscle filling the subscapular fossa on the anterior surface of scapula.',
    origin: 'Subscapular fossa of scapula.',
    insertion: 'Lesser tubercle of humerus.',
    action: 'Medial (internal) rotation of the arm; stabilizes humeral head in glenoid cavity.',
    nerveSupply: 'Upper and lower subscapular nerves (C5, C6).',
    clinicalRelevance: 'Prevents anterior displacement of the humeral head. Clinically evaluated using the Gerber lift-off test.'
  },
  {
    id: 'biceps-brachii',
    name: 'Biceps Brachii',
    region: 'Upper Limb',
    description: 'Prominent two-headed muscle on the anterior compartment of the arm.',
    origin: 'Short head: coracoid process of scapula. Long head: supraglenoid tubercle of scapula.',
    insertion: 'Radial tuberosity and bicipital aponeurosis.',
    action: 'Supination of forearm (strongest when elbow is flexed), flexion of forearm at elbow, and weak flexion of arm at shoulder.',
    nerveSupply: 'Musculocutaneous nerve (C5, C6, C7).',
    clinicalRelevance: 'Biceps tendon rupture leads to a classic "Popeye deformity". The biceps reflex is used to test the C5-C6 spinal nerve roots.'
  },
  {
    id: 'triceps-brachii',
    name: 'Triceps Brachii',
    region: 'Upper Limb',
    description: 'Large three-headed muscle on the posterior compartment of the arm.',
    origin: 'Long head: infraglenoid tubercle of scapula. Lateral head: posterior surface of humerus (above radial groove). Medial head: posterior surface of humerus (below radial groove).',
    insertion: 'Olecranon process of ulna.',
    action: 'Chief extensor of the forearm at the elbow joint; long head assists in resisting inferior displacement of humeral head.',
    nerveSupply: 'Radial nerve (C6, C7, C8).',
    clinicalRelevance: 'The triceps reflex is used to test the C7-C8 spinal nerve roots. Damage to radial nerve in the radial groove spares the long head but weakens elbow extension.'
  },
  {
    id: 'brachialis',
    name: 'Brachialis',
    region: 'Upper Limb',
    description: 'Flat muscle located deep to the biceps brachii on the lower half of the anterior arm.',
    origin: 'Distal half of anterior surface of humerus.',
    insertion: 'Coronoid process and tuberosity of ulna.',
    action: 'Chief flexor of the elbow joint (active in all positions of forearm pronation and supination).',
    nerveSupply: 'Musculocutaneous nerve (C5, C6); lateral part receives a small branch from the Radial nerve (C7).',
    clinicalRelevance: 'Considered the "workhorse" of the elbow joint because it is consistently active during elbow flexion regardless of forearm rotation.'
  },
  {
    id: 'brachioradialis',
    name: 'Brachioradialis',
    region: 'Upper Limb',
    description: 'Superficial muscle on the lateral side of the forearm.',
    origin: 'Proximal two-thirds of lateral supracondylar ridge of humerus.',
    insertion: 'Lateral aspect of styloid process of radius.',
    action: 'Flexes elbow joint, particularly when the forearm is in a midprone position; assists in pronation and supination to neutral.',
    nerveSupply: 'Radial nerve (C5, C6, C7).',
    clinicalRelevance: 'An exception to the rule: a flexor of the elbow joint that is innervated by the radial nerve (which typically supplies extensor muscles).'
  },
  {
    id: 'pronator-teres',
    name: 'Pronator Teres',
    region: 'Upper Limb',
    description: 'Fusiform muscle of the superficial anterior compartment of the forearm.',
    origin: 'Humeral head: medial epicondyle of humerus. Ulnar head: coronoid process of ulna.',
    insertion: 'Middle of lateral surface of radius.',
    action: 'Pronates forearm and weakly flexes elbow.',
    nerveSupply: 'Median nerve (C6, C7).',
    clinicalRelevance: 'Pronator syndrome is caused by entrapment of the median nerve between the two heads of this muscle, presenting as proximal forearm pain and sensory loss.'
  },
  {
    id: 'flexor-carpi-radialis',
    name: 'Flexor Carpi Radialis',
    region: 'Upper Limb',
    description: 'Slender superficial muscle of the anterior forearm.',
    origin: 'Medial epicondyle of humerus (common flexor origin).',
    insertion: 'Base of second metacarpal.',
    action: 'Flexes and abducts (deviates radially) the hand at the wrist joint.',
    nerveSupply: 'Median nerve (C6, C7).',
    clinicalRelevance: 'The radial artery lies immediately lateral to the FCR tendon at the wrist, serving as a critical landmark for palpating the radial pulse.'
  },
  {
    id: 'extensor-carpi-radialis-longus',
    name: 'Extensor Carpi Radialis Longus',
    region: 'Upper Limb',
    description: 'Elongated muscle on the lateral side of the forearm, partly deep to brachioradialis.',
    origin: 'Distal third of lateral supracondylar ridge of humerus.',
    insertion: 'Base of second metacarpal (dorsal aspect).',
    action: 'Extends and abducts hand at wrist joint.',
    nerveSupply: 'Radial nerve (C6, C7).',
    clinicalRelevance: 'Crucial for maintaining a strong grip; wrist extension prevents active insufficiency of the finger flexors during fist closure.'
  },
  {
    id: 'extensor-digitorum',
    name: 'Extensor Digitorum',
    region: 'Upper Limb',
    description: 'Principal extensor muscle of the fingers occupying the superficial posterior compartment of forearm.',
    origin: 'Lateral epicondyle of humerus (common extensor origin).',
    insertion: 'Extensor expansions of medial four digits.',
    action: 'Extends medial four digits at metacarpophalangeal (MCP) and interphalangeal (PIP, DIP) joints; assists wrist extension.',
    nerveSupply: 'Posterior interosseous nerve (C7, C8), a branch of the Radial nerve.',
    clinicalRelevance: 'Repetitive strain of the common extensor origin on the lateral epicondyle leads to lateral epicondylitis ("tennis elbow"), involving this muscle.'
  },

  // --- TRUNK ---
  {
    id: 'pectoralis-major',
    name: 'Pectoralis Major',
    region: 'Trunk',
    description: 'Thick, fan-shaped muscle on the anterior chest wall.',
    origin: 'Clavicular head: anterior surface of medial half of clavicle. Sternocostal head: anterior surface of sternum, superior 6 costal cartilages.',
    insertion: 'Lateral lip of intertubercular (bicipital) sulcus of humerus.',
    action: 'Adduction, medial rotation, and flexion (clavicular head) or extension (sternocostal head from flexed state) of the arm.',
    nerveSupply: 'Lateral and medial pectoral nerves (C5-T1).',
    clinicalRelevance: 'Poland syndrome presents as a congenital absence of the pectoralis major. Weakness in this muscle significantly affects climbing, pushing, or throwing.'
  },
  {
    id: 'latissimus-dorsi',
    name: 'Latissimus Dorsi',
    region: 'Trunk',
    description: 'Large, flat, triangular muscle covering the lower back.',
    origin: 'Spinous processes of lower 6 thoracic vertebrae, thoracolumbar fascia, iliac crest, and lower 3-4 ribs.',
    insertion: 'Floor of intertubercular (bicipital) sulcus of humerus.',
    action: 'Extension, adduction, and medial rotation of the arm (often called the "climber\'s muscle").',
    nerveSupply: 'Thoracodorsal nerve (C6, C7, C8).',
    clinicalRelevance: 'Frequently harvested as a pedicled or free flap in reconstructive breast surgery. Injury to its nerve during axillary clearance impairs crutch-walking.'
  },
  {
    id: 'iliopsoas',
    name: 'Iliopsoas',
    region: 'Trunk',
    description: 'Strong composite hip flexor muscle formed by the psoas major and iliacus muscles.',
    origin: 'Psoas Major: transverse processes and bodies of T12-L5 vertebrae. Iliacus: iliac fossa of ilium.',
    insertion: 'Lesser trochanter of femur.',
    action: 'Primary flexor of the thigh at the hip joint; stabilizes the hip joint and flexes trunk when acting bilaterally.',
    nerveSupply: 'Psoas major: anterior rami of L1-L3. Iliacus: femoral nerve (L2, L3).',
    clinicalRelevance: 'A psoas abscess (secondary to spinal tuberculosis or Crohn\'s disease) tracks under the inguinal ligament. A positive Psoas sign indicates retrocecal appendicitis.'
  },

  // --- LOWER LIMB ---
  {
    id: 'gluteus-maximus',
    name: 'Gluteus Maximus',
    region: 'Lower Limb',
    description: 'Largest and most superficial gluteal muscle, forming the prominence of the buttock.',
    origin: 'Ilium posterior to posterior gluteal line, dorsal surface of sacrum/coccyx, and sacrotuberous ligament.',
    insertion: 'Iliotibial tract and gluteal tuberosity of femur.',
    action: 'Powerful extension of the thigh (especially from a flexed position, such as rising from sitting or climbing stairs); lateral rotation of thigh.',
    nerveSupply: 'Inferior gluteal nerve (L5, S1, S2).',
    clinicalRelevance: 'Weakness causes "Gluteus Maximus lurch" (backward trunk tilt at heel strike to prevent falling forward). Checked in rising from a chair.'
  },
  {
    id: 'gluteus-medius',
    name: 'Gluteus Medius',
    region: 'Lower Limb',
    description: 'Broad, fan-shaped muscle lying deep to gluteus maximus on the lateral hip.',
    origin: 'Outer surface of ilium between anterior and posterior gluteal lines.',
    insertion: 'Lateral surface of greater trochanter of femur.',
    action: 'Abducts and medially rotates thigh; stabilizes pelvis during single-leg stance to prevent the contralateral side from dropping.',
    nerveSupply: 'Superior gluteal nerve (L4, L5, S1).',
    clinicalRelevance: 'Weakness or nerve injury leads to a positive Trendelenburg sign, causing the pelvis to drop on the unsupported side during walking (Trendelenburg gait).'
  },
  {
    id: 'sartorius',
    name: 'Sartorius',
    region: 'Lower Limb',
    description: 'Longest muscle in the human body, running obliquely down the anterior thigh compartment.',
    origin: 'Anterior superior iliac spine (ASIS).',
    insertion: 'Proximal medial tibia (via the pes anserinus tendon).',
    action: 'Flexes, abducts, and laterally rotates the thigh at the hip; flexes and medially rotates the leg at the knee ("cross-legged tailor\'s position").',
    nerveSupply: 'Femoral nerve (L2, L3).',
    clinicalRelevance: 'Forms pes anserinus with gracilis and semitendinosus. Subject to pes anserine bursitis in athletes and runners, causing medial knee pain.'
  },
  {
    id: 'rectus-femoris',
    name: 'Rectus Femoris',
    region: 'Lower Limb',
    description: 'Fusiform, bipennate muscle of the anterior thigh, part of the quadriceps femoris group.',
    origin: 'Straight head: anterior inferior iliac spine (AIIS). Reflected head: ilium superior to acetabulum.',
    insertion: 'Base of patella and via patellar ligament into tibial tuberosity.',
    action: 'Flexes the thigh at the hip joint; extends the leg at the knee joint.',
    nerveSupply: 'Femoral nerve (L2, L3, L4).',
    clinicalRelevance: 'Highly susceptible to strain or avulsion fractures at the AIIS in sprinters and kicker athletes. It is the only quadriceps muscle crossing both hip and knee.'
  },
  {
    id: 'vastus-medialis',
    name: 'Vastus Medialis',
    region: 'Lower Limb',
    description: 'Medial component of the quadriceps femoris muscle group.',
    origin: 'Intertrochanteric line and medial lip of linea aspera of femur.',
    insertion: 'Medial border of patella and tibial tuberosity.',
    action: 'Extends leg at knee joint; stabilizes the patella (especially the distal Vastus Medialis Oblique / VMO fibers).',
    nerveSupply: 'Femoral nerve (L2, L3, L4).',
    clinicalRelevance: 'Weakness of VMO fibers results in lateral patellar tracking and patellofemoral pain syndrome (Runner\'s Knee), presenting as anterior knee pain.'
  },
  {
    id: 'vastus-lateralis',
    name: 'Vastus Lateralis',
    region: 'Lower Limb',
    description: 'Largest and most lateral component of the quadriceps femoris muscle group.',
    origin: 'Greater trochanter and lateral lip of linea aspera of femur.',
    insertion: 'Lateral border of patella and tibial tuberosity.',
    action: 'Extends leg at knee joint.',
    nerveSupply: 'Femoral nerve (L2, L3, L4).',
    clinicalRelevance: 'The preferred site for pediatric intramuscular injections because it lacks major nerves or large blood vessels in its mid-substance.'
  },
  {
    id: 'adductor-longus',
    name: 'Adductor Longus',
    region: 'Lower Limb',
    description: 'Large, flat, triangular muscle of the medial thigh compartment.',
    origin: 'Body of pubis, inferior to pubic crest.',
    insertion: 'Middle third of linea aspera of femur.',
    action: 'Adducts and medially rotates thigh at the hip joint.',
    nerveSupply: 'Obturator nerve (L2, L3, L4).',
    clinicalRelevance: 'Frequently strained in sports requiring explosive lateral movements or changes in direction, commonly known as a groin strain.'
  },
  {
    id: 'biceps-femoris',
    name: 'Biceps Femoris',
    region: 'Lower Limb',
    description: 'Two-headed hamstring muscle occupying the lateral posterior thigh.',
    origin: 'Long head: ischial tuberosity. Short head: lateral lip of linea aspera of femur.',
    insertion: 'Lateral side of head of fibula.',
    action: 'Flexes leg at knee joint; extends thigh at hip (long head only); laterally rotates leg when knee is flexed.',
    nerveSupply: 'Long head: tibial division of sciatic nerve (L5, S1, S2). Short head: common fibular division of sciatic nerve (L5, S1, S2).',
    clinicalRelevance: 'The most commonly strained hamstring muscle. Injuries typically occur during high-speed running, specifically during terminal swing.'
  },
  {
    id: 'semitendinosus',
    name: 'Semitendinosus',
    region: 'Lower Limb',
    description: 'Posterior thigh hamstring muscle characterized by an extremely long tendon of insertion.',
    origin: 'Ischial tuberosity.',
    insertion: 'Proximal medial surface of tibia (via the pes anserinus tendon).',
    action: 'Flexes leg at knee joint; extends thigh at hip; medially rotates leg when knee is flexed.',
    nerveSupply: 'Tibial division of sciatic nerve (L5, S1, S2).',
    clinicalRelevance: 'The tendon of this muscle is commonly harvested as an autograft for ACL (Anterior Cruciate Ligament) reconstruction surgery.'
  },
  {
    id: 'tibialis-anterior',
    name: 'Tibialis Anterior',
    region: 'Lower Limb',
    description: 'Thick, superficial muscle on the lateral aspect of tibia in the anterior compartment of leg.',
    origin: 'Lateral condyle and superior half of lateral surface of tibia, and interosseous membrane.',
    insertion: 'Medial cuneiform and base of first metatarsal.',
    action: 'Dorsiflexes foot at ankle joint; inverts foot.',
    nerveSupply: 'Deep fibular (peroneal) nerve (L4, L5).',
    clinicalRelevance: 'Injury to deep fibular nerve causes foot drop (high-steppage gait). Repetitive mechanical overload leads to shin splints (anterior tibial stress syndrome).'
  },
  {
    id: 'gastrocnemius',
    name: 'Gastrocnemius',
    region: 'Lower Limb',
    description: 'Most superficial, two-headed muscle of the posterior compartment of leg, forming the bulk of the calf.',
    origin: 'Lateral head: lateral condyle of femur. Medial head: medial condyle of femur (above adductor tubercle).',
    insertion: 'Posterior surface of calcaneus via Achilles (calcaneal) tendon.',
    action: 'Plantarflexes foot at ankle joint; flexes leg at knee joint.',
    nerveSupply: 'Tibial nerve (S1, S2).',
    clinicalRelevance: 'Susceptible to acute rupture of the tendon (Achilles tendon rupture), clinically tested using the Thompson squeeze test. Strains are called tennis leg.'
  },
  {
    id: 'soleus',
    name: 'Soleus',
    region: 'Lower Limb',
    description: 'Broad, flat, powerful muscle lying immediately deep to gastrocnemius, forming the lower part of the calf.',
    origin: 'Posterior aspect of head and upper shaft of fibula, soleal line of tibia.',
    insertion: 'Posterior surface of calcaneus via Achilles tendon.',
    action: 'Powerful plantarflexion of foot at ankle joint (active regardless of elbow or knee flexion position).',
    nerveSupply: 'Tibial nerve (S1, S2).',
    clinicalRelevance: 'Acts as the "skeletal muscle heart" or "second heart" because its contraction is critical for venous return from the lower limbs.'
  },
  {
    id: 'tibialis-posterior',
    name: 'Tibialis Posterior',
    region: 'Lower Limb',
    description: 'Deepest muscle in the posterior compartment of leg, lying between flexor digitorum longus and flexor hallucis longus.',
    origin: 'Posterior surface of tibia, fibula, and interosseous membrane.',
    insertion: 'Tuberosity of navicular bone, cuneiforms, cuboid, and bases of second to fourth metatarsals.',
    action: 'Principal inverter of foot; plantarflexes foot; supports medial longitudinal arch of foot.',
    nerveSupply: 'Tibial nerve (L4, L5).',
    clinicalRelevance: 'Dysfunction or tendon tear leads to adult-acquired flatfoot (pes planus) and a characteristic "too many toes" sign visible from behind.'
  },
  {
    id: 'fibularis-longus',
    name: 'Fibularis Longus',
    region: 'Lower Limb',
    description: 'Superficial muscle in the lateral compartment of the leg.',
    origin: 'Head and superior two-thirds of lateral surface of fibula.',
    insertion: 'Base of first metatarsal and medial cuneiform (crossing the sole of foot).',
    action: 'Everts foot and weakly plantarflexes ankle; supports the transverse arch of foot.',
    nerveSupply: 'Superficial fibular (peroneal) nerve (L5, S1, S2).',
    clinicalRelevance: 'Important for lateral ankle stability; weakness pre-disposes to inversion ankle sprains.'
  }
];

export const TODAYS_MUSCLE_IDS = [
  'deltoid',
  'supraspinatus',
  'biceps-brachii',
  'gluteus-medius',
  'tibialis-anterior'
];
