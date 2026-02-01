import * as THREE from 'three';

export interface HumanoidJoints {
  root: THREE.Object3D;
  spine: THREE.Object3D;
  chest: THREE.Object3D;
  neck: THREE.Object3D;
  head: THREE.Object3D;
  leftShoulder: THREE.Object3D;
  leftElbow: THREE.Object3D;
  leftWrist: THREE.Object3D;
  rightShoulder: THREE.Object3D;
  rightElbow: THREE.Object3D;
  rightWrist: THREE.Object3D;
  leftHip: THREE.Object3D;
  leftKnee: THREE.Object3D;
  leftAnkle: THREE.Object3D;
  leftToe: THREE.Object3D;
  rightHip: THREE.Object3D;
  rightKnee: THREE.Object3D;
  rightAnkle: THREE.Object3D;
  rightToe: THREE.Object3D;
}

export class HumanoidRig {
  group = new THREE.Group();
  joints: HumanoidJoints;
  gaitPhase = 0;

  private clock = 0;

  constructor() {
    this.group.position.set(0, 0, 0);
    this.group.name = 'humanoid';

    const root = new THREE.Object3D();
    const spine = new THREE.Object3D();
    const chest = new THREE.Object3D();
    const neck = new THREE.Object3D();
    const head = new THREE.Object3D();

    const leftShoulder = new THREE.Object3D();
    const leftElbow = new THREE.Object3D();
    const leftWrist = new THREE.Object3D();
    const rightShoulder = new THREE.Object3D();
    const rightElbow = new THREE.Object3D();
    const rightWrist = new THREE.Object3D();

    const leftHip = new THREE.Object3D();
    const leftKnee = new THREE.Object3D();
    const leftAnkle = new THREE.Object3D();
    const leftToe = new THREE.Object3D();
    const rightHip = new THREE.Object3D();
    const rightKnee = new THREE.Object3D();
    const rightAnkle = new THREE.Object3D();
    const rightToe = new THREE.Object3D();

    root.add(spine);
    spine.add(chest);
    chest.add(neck);
    neck.add(head);

    chest.add(leftShoulder);
    chest.add(rightShoulder);
    leftShoulder.add(leftElbow);
    leftElbow.add(leftWrist);
    rightShoulder.add(rightElbow);
    rightElbow.add(rightWrist);

    root.add(leftHip);
    root.add(rightHip);
    leftHip.add(leftKnee);
    leftKnee.add(leftAnkle);
    leftAnkle.add(leftToe);
    rightHip.add(rightKnee);
    rightKnee.add(rightAnkle);
    rightAnkle.add(rightToe);

    this.joints = {
      root,
      spine,
      chest,
      neck,
      head,
      leftShoulder,
      leftElbow,
      leftWrist,
      rightShoulder,
      rightElbow,
      rightWrist,
      leftHip,
      leftKnee,
      leftAnkle,
      leftToe,
      rightHip,
      rightKnee,
      rightAnkle,
      rightToe,
    };

    root.position.set(0, 1.05, 0);
    spine.position.set(0, 0.18, 0);
    chest.position.set(0, 0.25, 0);
    neck.position.set(0, 0.18, 0);
    head.position.set(0, 0.14, 0);

    leftShoulder.position.set(-0.18, 0.14, 0);
    rightShoulder.position.set(0.18, 0.14, 0);
    leftElbow.position.set(-0.22, -0.22, 0.02);
    rightElbow.position.set(0.22, -0.22, 0.02);
    leftWrist.position.set(-0.18, -0.22, -0.04);
    rightWrist.position.set(0.18, -0.22, -0.04);

    leftHip.position.set(-0.12, -0.05, 0);
    rightHip.position.set(0.12, -0.05, 0);
    leftKnee.position.set(0, -0.45, 0.08);
    rightKnee.position.set(0, -0.45, -0.08);
    leftAnkle.position.set(0, -0.42, -0.05);
    rightAnkle.position.set(0, -0.42, 0.05);
    leftToe.position.set(0, -0.08, 0.18);
    rightToe.position.set(0, -0.08, 0.18);

    this.group.add(root);

    this.createBodyMeshes();
  }

  update(delta: number, speed: number) {
    this.clock += delta * speed;
    const phase = (this.clock * 0.8) % 1;
    this.gaitPhase = phase;

    const swing = Math.sin(phase * Math.PI * 2);
    const lift = Math.max(0, Math.sin(phase * Math.PI * 2));

    this.joints.leftHip.rotation.x = swing * 0.6;
    this.joints.rightHip.rotation.x = -swing * 0.6;
    this.joints.leftKnee.rotation.x = Math.max(0, -swing) * 0.9;
    this.joints.rightKnee.rotation.x = Math.max(0, swing) * 0.9;

    this.joints.leftAnkle.rotation.x = -this.joints.leftKnee.rotation.x * 0.4;
    this.joints.rightAnkle.rotation.x = -this.joints.rightKnee.rotation.x * 0.4;

    this.joints.leftShoulder.rotation.x = -swing * 0.4;
    this.joints.rightShoulder.rotation.x = swing * 0.4;
    this.joints.leftElbow.rotation.x = Math.max(0, swing) * 0.3;
    this.joints.rightElbow.rotation.x = Math.max(0, -swing) * 0.3;

    this.joints.root.position.y = 1.05 + lift * 0.06;
    this.joints.spine.rotation.x = swing * 0.08;
    this.joints.chest.rotation.y = swing * 0.08;
    this.joints.neck.rotation.x = -swing * 0.06;
  }

  private createBodyMeshes() {
    const material = new THREE.MeshStandardMaterial({
      color: 0x5c7ea6,
      roughness: 0.5,
      metalness: 0.1,
    });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), material);
    head.position.set(0, 0.12, 0);
    this.joints.head.add(head);

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.45, 8, 16), material);
    torso.position.set(0, 0.1, 0);
    this.joints.spine.add(torso);

    const upperArm = new THREE.CapsuleGeometry(0.05, 0.22, 6, 12);
    const lowerArm = new THREE.CapsuleGeometry(0.045, 0.2, 6, 12);
    const upperLeg = new THREE.CapsuleGeometry(0.065, 0.35, 6, 12);
    const lowerLeg = new THREE.CapsuleGeometry(0.06, 0.34, 6, 12);

    const leftUpperArm = new THREE.Mesh(upperArm, material);
    leftUpperArm.position.set(-0.1, -0.1, 0);
    this.joints.leftShoulder.add(leftUpperArm);

    const rightUpperArm = new THREE.Mesh(upperArm, material);
    rightUpperArm.position.set(0.1, -0.1, 0);
    this.joints.rightShoulder.add(rightUpperArm);

    const leftLowerArm = new THREE.Mesh(lowerArm, material);
    leftLowerArm.position.set(-0.05, -0.12, 0);
    this.joints.leftElbow.add(leftLowerArm);

    const rightLowerArm = new THREE.Mesh(lowerArm, material);
    rightLowerArm.position.set(0.05, -0.12, 0);
    this.joints.rightElbow.add(rightLowerArm);

    const leftUpperLeg = new THREE.Mesh(upperLeg, material);
    leftUpperLeg.position.set(0, -0.18, 0);
    this.joints.leftHip.add(leftUpperLeg);

    const rightUpperLeg = new THREE.Mesh(upperLeg, material);
    rightUpperLeg.position.set(0, -0.18, 0);
    this.joints.rightHip.add(rightUpperLeg);

    const leftLowerLeg = new THREE.Mesh(lowerLeg, material);
    leftLowerLeg.position.set(0, -0.16, 0);
    this.joints.leftKnee.add(leftLowerLeg);

    const rightLowerLeg = new THREE.Mesh(lowerLeg, material);
    rightLowerLeg.position.set(0, -0.16, 0);
    this.joints.rightKnee.add(rightLowerLeg);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.18), material);
    leftFoot.position.set(0, -0.05, 0.1);
    this.joints.leftAnkle.add(leftFoot);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.18), material);
    rightFoot.position.set(0, -0.05, 0.1);
    this.joints.rightAnkle.add(rightFoot);
  }
}
