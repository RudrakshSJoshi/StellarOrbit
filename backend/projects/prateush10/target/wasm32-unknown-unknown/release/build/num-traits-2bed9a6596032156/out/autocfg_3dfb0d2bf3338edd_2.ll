; ModuleID = 'autocfg_3dfb0d2bf3338edd_2.a2f97a3a5715ffc3-cgu.0'
source_filename = "autocfg_3dfb0d2bf3338edd_2.a2f97a3a5715ffc3-cgu.0"
target datalayout = "e-m:e-p:32:32-p10:8:8-p20:8:8-i64:64-n32:64-S128-ni:1:10:20"
target triple = "wasm32-unknown-unknown"

; autocfg_3dfb0d2bf3338edd_2::probe
; Function Attrs: nounwind
define dso_local void @_ZN26autocfg_3dfb0d2bf3338edd_25probe17h89ccfd38988b0bd3E() unnamed_addr #0 {
start:
  %0 = alloca [4 x i8], align 4
  store i32 -2147483648, ptr %0, align 4
  %_0.i = load i32, ptr %0, align 4
  ret void
}

; Function Attrs: nocallback nofree nosync nounwind speculatable willreturn memory(none)
declare i32 @llvm.bitreverse.i32(i32) #1

attributes #0 = { nounwind "target-cpu"="generic" }
attributes #1 = { nocallback nofree nosync nounwind speculatable willreturn memory(none) }

!llvm.ident = !{!0}

!0 = !{!"rustc version 1.85.1 (4eb161250 2025-03-15)"}
